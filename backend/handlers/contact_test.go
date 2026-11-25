package handlers

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
)

func contactTestRequest(ip, body string) *httptest.ResponseRecorder {
	gin.SetMode(gin.TestMode)
	handler := NewContactHandler(nil)
	router := gin.New()
	router.POST("/api/contact", handler.Submit)

	req := httptest.NewRequest(http.MethodPost, "/api/contact", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Forwarded-For", ip)
	res := httptest.NewRecorder()
	router.ServeHTTP(res, req)
	return res
}

func clearContactEnv(t *testing.T) {
	t.Helper()
	for _, key := range []string{
		"SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASSWORD",
		"CONTACT_EMAIL_FROM", "CONTACT_EMAIL_TO", "SMS_PROVIDER", "SMS_TO",
		"TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_FROM",
		"AFRICASTALKING_USERNAME", "AFRICASTALKING_API_KEY",
	} {
		t.Setenv(key, "")
	}
}

func TestContactSubmitValidation(t *testing.T) {
	clearContactEnv(t)

	res := contactTestRequest("10.1.0.1", `{"name":"Test","email":"not-an-email","subject":"Hi","message":"This is a valid length message"}`)
	if res.Code != http.StatusBadRequest {
		t.Fatalf("invalid email status = %d, want %d", res.Code, http.StatusBadRequest)
	}

	res = contactTestRequest("10.1.0.2", `{"name":"Test","email":"test@example.com","subject":"Hi","message":"short"}`)
	if res.Code != http.StatusBadRequest {
		t.Fatalf("short message status = %d, want %d", res.Code, http.StatusBadRequest)
	}
}

func TestContactSubmitHoneypotAndUnconfigured(t *testing.T) {
	clearContactEnv(t)

	res := contactTestRequest("10.2.0.1", `{"name":"Bot","email":"bot@example.com","subject":"Hi","message":"This is a valid length message","website":"https://spam.example"}`)
	if res.Code != http.StatusAccepted {
		t.Fatalf("honeypot status = %d, want %d", res.Code, http.StatusAccepted)
	}

	res = contactTestRequest("10.2.0.2", `{"name":"Test","email":"test@example.com","subject":"Hi","message":"This is a valid length message"}`)
	if res.Code != http.StatusServiceUnavailable {
		t.Fatalf("unconfigured status = %d, want %d", res.Code, http.StatusServiceUnavailable)
	}
}

func TestContactSubmitRateLimit(t *testing.T) {
	clearContactEnv(t)
	body := `{"name":"Test","email":"test@example.com","subject":"Hi","message":"This is a valid length message"}`

	gin.SetMode(gin.TestMode)
	handler := NewContactHandler(nil)
	router := gin.New()
	router.POST("/api/contact", handler.Submit)

	var lastCode int
	for i := 0; i < contactRateLimit+1; i++ {
		req := httptest.NewRequest(http.MethodPost, "/api/contact", strings.NewReader(body))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-Forwarded-For", "10.3.0.1")
		res := httptest.NewRecorder()
		router.ServeHTTP(res, req)
		lastCode = res.Code
	}
	if lastCode != http.StatusTooManyRequests {
		t.Fatalf("rate limit status = %d, want %d", lastCode, http.StatusTooManyRequests)
	}
}

func TestContactConfigChannels(t *testing.T) {
	clearContactEnv(t)
	cfg := loadContactConfig()
	if cfg.emailEnabled() || cfg.smsEnabled() {
		t.Fatalf("channels should be disabled without credentials")
	}

	t.Setenv("SMTP_USER", "mail@example.com")
	t.Setenv("SMTP_PASSWORD", "app-password")
	cfg = loadContactConfig()
	if !cfg.emailEnabled() {
		t.Fatalf("email should be enabled with SMTP credentials")
	}

	t.Setenv("SMS_PROVIDER", "twilio")
	t.Setenv("TWILIO_ACCOUNT_SID", "sid")
	t.Setenv("TWILIO_AUTH_TOKEN", "token")
	t.Setenv("TWILIO_FROM", "+254700000000")
	cfg = loadContactConfig()
	if !cfg.smsEnabled() {
		t.Fatalf("SMS should be enabled with Twilio credentials")
	}
}
