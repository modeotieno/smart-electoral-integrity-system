package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"mime"
	"net/http"
	"net/smtp"
	"net/url"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

const (
	contactRateWindow   = 10 * time.Minute
	contactRateLimit    = 5
	contactDeliveryWait = 10 * time.Second
	contactMaxSMSLength = 480
)

type ContactHandler struct {
	Pool     *pgxpool.Pool
	mu       sync.Mutex
	attempts map[string][]time.Time
}

func NewContactHandler(pool *pgxpool.Pool) *ContactHandler {
	return &ContactHandler{Pool: pool, attempts: make(map[string][]time.Time)}
}

type contactRequest struct {
	Name    string `json:"name"`
	Email   string `json:"email"`
	Subject string `json:"subject"`
	Message string `json:"message"`
	Website string `json:"website"`
}

type contactConfig struct {
	EmailTo            string
	EmailFrom          string
	SMTPHost           string
	SMTPPort           string
	SMTPUser           string
	SMTPPassword       string
	SMSProvider        string
	SMSTo              string
	TwilioSID          string
	TwilioToken        string
	TwilioFrom         string
	AfricasTalkingUser string
	AfricasTalkingKey  string
}

func loadContactConfig() contactConfig {
	cfg := contactConfig{
		EmailTo:            envOr("CONTACT_EMAIL_TO", "otienomodesta505@gmail.com"),
		SMTPHost:           envOr("SMTP_HOST", "smtp.gmail.com"),
		SMTPPort:           envOr("SMTP_PORT", "587"),
		SMTPUser:           os.Getenv("SMTP_USER"),
		SMTPPassword:       os.Getenv("SMTP_PASSWORD"),
		SMSProvider:        strings.ToLower(strings.TrimSpace(os.Getenv("SMS_PROVIDER"))),
		SMSTo:              envOr("SMS_TO", "+254727822752"),
		TwilioSID:          os.Getenv("TWILIO_ACCOUNT_SID"),
		TwilioToken:        os.Getenv("TWILIO_AUTH_TOKEN"),
		TwilioFrom:         os.Getenv("TWILIO_FROM"),
		AfricasTalkingUser: os.Getenv("AFRICASTALKING_USERNAME"),
		AfricasTalkingKey:  os.Getenv("AFRICASTALKING_API_KEY"),
	}
	cfg.EmailFrom = envOr("CONTACT_EMAIL_FROM", cfg.SMTPUser)
	return cfg
}

func envOr(key, fallback string) string {
	if value := strings.TrimSpace(os.Getenv(key)); value != "" {
		return value
	}
	return fallback
}

func (c contactConfig) emailEnabled() bool {
	return c.SMTPUser != "" && c.SMTPPassword != "" && c.EmailTo != "" && c.EmailFrom != ""
}

func (c contactConfig) smsEnabled() bool {
	if c.SMSProvider == "" || c.SMSProvider == "none" || c.SMSTo == "" {
		return false
	}
	switch c.SMSProvider {
	case "twilio":
		return c.TwilioSID != "" && c.TwilioToken != "" && c.TwilioFrom != ""
	case "africastalking":
		return c.AfricasTalkingUser != "" && c.AfricasTalkingKey != ""
	default:
		return false
	}
}

func (h *ContactHandler) allow(key string) bool {
	now := time.Now()
	h.mu.Lock()
	defer h.mu.Unlock()
	recent := h.attempts[key][:0]
	for _, at := range h.attempts[key] {
		if now.Sub(at) < contactRateWindow {
			recent = append(recent, at)
		}
	}
	if len(recent) >= contactRateLimit {
		h.attempts[key] = recent
		return false
	}
	h.attempts[key] = append(recent, now)
	if len(h.attempts) > 10000 {
		for ip, times := range h.attempts {
			if len(times) == 0 || now.Sub(times[len(times)-1]) >= contactRateWindow {
				delete(h.attempts, ip)
			}
		}
	}
	return true
}

func (h *ContactHandler) Submit(c *gin.Context) {
	if !h.allow(c.ClientIP()) {
		c.JSON(http.StatusTooManyRequests, gin.H{"error": "Too many messages. Please try again later."})
		return
	}

	var req contactRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid message payload"})
		return
	}
	if req.Website != "" {
		c.JSON(http.StatusAccepted, gin.H{"message": "Your message has been sent."})
		return
	}

	req.Name = strings.TrimSpace(req.Name)
	req.Email = strings.TrimSpace(req.Email)
	req.Subject = strings.TrimSpace(req.Subject)
	req.Message = strings.TrimSpace(req.Message)
	if req.Name == "" || len(req.Name) > 150 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Name is required and must be at most 150 characters"})
		return
	}
	if !strings.Contains(req.Email, "@") || len(req.Email) > 150 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "A valid email address is required"})
		return
	}
	if req.Subject == "" || len(req.Subject) > 200 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Subject is required and must be at most 200 characters"})
		return
	}
	if len(req.Message) < 10 || len(req.Message) > 5000 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Message must be between 10 and 5000 characters"})
		return
	}

	cfg := loadContactConfig()
	storageEnabled := h.Pool != nil
	if !storageEnabled && !cfg.emailEnabled() && !cfg.smsEnabled() {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Contact form is not configured yet. Please email or call the contact listed on this page."})
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), contactDeliveryWait)
	defer cancel()

	var id int64
	var stored bool
	if storageEnabled {
		err := h.Pool.QueryRow(ctx, `INSERT INTO contact_messages (name, email, subject, message, ip_address) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
			req.Name, req.Email, req.Subject, req.Message, c.ClientIP(),
		).Scan(&id)
		if err != nil {
			log.Printf("contact: database insert failed: %v", err)
		} else {
			stored = true
		}
	}

	emailSent := false
	if cfg.emailEnabled() {
		if err := sendContactEmail(ctx, cfg, req, c.ClientIP()); err != nil {
			log.Printf("contact: email delivery failed: %v", err)
		} else {
			emailSent = true
		}
	}

	smsSent := false
	if cfg.smsEnabled() {
		if err := sendContactSMS(ctx, cfg, req); err != nil {
			log.Printf("contact: SMS delivery failed: %v", err)
		} else {
			smsSent = true
		}
	}

	if stored {
		_, _ = h.Pool.Exec(ctx, `UPDATE contact_messages SET email_sent=$1, sms_sent=$2 WHERE id=$3`, emailSent, smsSent, id)
	}

	warnings := []string{}
	if !stored {
		warnings = append(warnings, "Message could not be saved")
	}
	if cfg.emailEnabled() && !emailSent {
		warnings = append(warnings, "Email notification was not delivered")
	}
	if cfg.smsEnabled() && !smsSent {
		warnings = append(warnings, "SMS notification was not delivered")
	}
	if !stored && !emailSent && !smsSent {
		c.JSON(http.StatusBadGateway, gin.H{"error": "We could not deliver your message. Please try again or use the email/phone listed on this page."})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Your message has been sent.",
		"id":      id,
		"delivery": gin.H{
			"stored":    stored,
			"emailSent": emailSent,
			"smsSent":   smsSent,
		},
		"warnings": warnings,
	})
}

func sanitizeHeader(value string) string {
	return strings.NewReplacer("\r", "", "\n", " ").Replace(value)
}

func sendContactEmail(ctx context.Context, cfg contactConfig, req contactRequest, ip string) error {
	var body bytes.Buffer
	fmt.Fprintf(&body, "From: %s <%s>\r\n", mime.QEncoding.Encode("utf-8", sanitizeHeader(req.Name)), cfg.EmailFrom)
	fmt.Fprintf(&body, "To: %s\r\n", cfg.EmailTo)
	fmt.Fprintf(&body, "Subject: %s\r\n", mime.QEncoding.Encode("utf-8", "SEIS contact: "+sanitizeHeader(req.Subject)))
	body.WriteString("MIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\n")
	fmt.Fprintf(&body, "Name: %s\r\nEmail: %s\r\nSubject: %s\r\nIP: %s\r\n\r\n%s\r\n",
		sanitizeHeader(req.Name), sanitizeHeader(req.Email), sanitizeHeader(req.Subject), sanitizeHeader(ip), req.Message)

	addr := cfg.SMTPHost + ":" + cfg.SMTPPort
	auth := smtp.PlainAuth("", cfg.SMTPUser, cfg.SMTPPassword, cfg.SMTPHost)
	result := make(chan error, 1)
	go func() {
		result <- smtp.SendMail(addr, auth, cfg.EmailFrom, []string{cfg.EmailTo}, body.Bytes())
	}()
	select {
	case err := <-result:
		return err
	case <-ctx.Done():
		return ctx.Err()
	}
}

func smsBody(req contactRequest) string {
	body := fmt.Sprintf("SEIS contact from %s (%s)\nSubject: %s\n%s", req.Name, req.Email, req.Subject, req.Message)
	runes := []rune(body)
	if len(runes) > contactMaxSMSLength {
		return string(runes[:contactMaxSMSLength-1]) + "…"
	}
	return body
}

func sendContactSMS(ctx context.Context, cfg contactConfig, req contactRequest) error {
	switch cfg.SMSProvider {
	case "twilio":
		return sendTwilioSMS(ctx, cfg, smsBody(req))
	case "africastalking":
		return sendAfricasTalkingSMS(ctx, cfg, smsBody(req))
	default:
		return fmt.Errorf("unsupported SMS provider %q", cfg.SMSProvider)
	}
}

func postForm(ctx context.Context, endpoint string, form url.Values, headers map[string]string) (*http.Response, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, strings.NewReader(form.Encode()))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	for key, value := range headers {
		req.Header.Set(key, value)
	}
	return http.DefaultClient.Do(req)
}

func responseError(res *http.Response) error {
	defer res.Body.Close()
	body, _ := io.ReadAll(io.LimitReader(res.Body, 512))
	return fmt.Errorf("provider returned HTTP %d: %s", res.StatusCode, strings.TrimSpace(string(body)))
}

func sendTwilioSMS(ctx context.Context, cfg contactConfig, body string) error {
	endpoint := fmt.Sprintf("https://api.twilio.com/2010-04-01/Accounts/%s/Messages.json", url.PathEscape(cfg.TwilioSID))
	res, err := postForm(ctx, endpoint, url.Values{
		"To":   {cfg.SMSTo},
		"From": {cfg.TwilioFrom},
		"Body": {body},
	}, nil)
	if err != nil {
		return err
	}
	if res.StatusCode < 200 || res.StatusCode >= 300 {
		return responseError(res)
	}
	res.Body.Close()
	return nil
}

func sendAfricasTalkingSMS(ctx context.Context, cfg contactConfig, body string) error {
	res, err := postForm(ctx, "https://api.africastalking.com/version1/messaging", url.Values{
		"username": {cfg.AfricasTalkingUser},
		"to":       {cfg.SMSTo},
		"message":  {body},
	}, map[string]string{"ApiKey": cfg.AfricasTalkingKey})
	if err != nil {
		return err
	}
	defer res.Body.Close()
	if res.StatusCode < 200 || res.StatusCode >= 300 {
		return responseError(res)
	}
	var result struct {
		SMSMessageData struct {
			Recipients []struct {
				Status string `json:"status"`
			} `json:"Recipients"`
		} `json:"SMSMessageData"`
	}
	if err := json.NewDecoder(io.LimitReader(res.Body, 1<<20)).Decode(&result); err != nil {
		return err
	}
	if len(result.SMSMessageData.Recipients) == 0 {
		return fmt.Errorf("no recipients in provider response")
	}
	for _, recipient := range result.SMSMessageData.Recipients {
		if !strings.EqualFold(recipient.Status, "Success") {
			return fmt.Errorf("provider rejected recipient: %s", recipient.Status)
		}
	}
	return nil
}
