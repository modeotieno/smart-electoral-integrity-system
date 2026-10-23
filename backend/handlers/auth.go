package handlers

import (
	"context"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"

	"github.com/modeotieno/smart-electoral-integrity-system/auth"
)

type AuthHandler struct {
	Pool *pgxpool.Pool
}

var allowedRoles = map[string]bool{
	"citizen":                true,
	"voter":                  true,
	"observer":               true,
	"candidate":              true,
	"presiding_officer":      true,
	"returning_officer":      true,
	"election_administrator": true,
	"system_administrator":   true,
	"admin":                  true,
}

func normalizeRole(r string) string {
	r = strings.ToLower(strings.TrimSpace(r))
	if r == "" {
		return "citizen"
	}
	// map common UI labels and app payload aliases
	switch r {
	case "citizen", "voter", "user", "mobile_user", "web_user", "member":
		return "citizen"
	case "election observer", "observer":
		return "observer"
	case "candidate":
		return "candidate"
	case "presiding officer":
		return "presiding_officer"
	case "returning officer":
		return "returning_officer"
	case "election administrator", "admin", "system administrator", "system_administrator":
		return "election_administrator"
	}
	if allowedRoles[r] {
		return r
	}
	return "citizen"
}

func firstNonEmpty(values ...string) string {
	for _, v := range values {
		if strings.TrimSpace(v) != "" {
			return strings.TrimSpace(v)
		}
	}
	return ""
}

func normalizeName(values ...string) string {
	return strings.TrimSpace(firstNonEmpty(values...))
}

type registerRequest struct {
	FullName    string `json:"full_name"`
	Name        string `json:"name"`
	FullNameAlt string `json:"fullName"`
	Email       string `json:"email"`
	Password    string `json:"password"`
	Role        string `json:"role"`
	UserType    string `json:"userType"`
	AccountType string `json:"accountType"`
	RoleName    string `json:"role_name"`
}

func (r *registerRequest) normalize() {
	r.FullName = normalizeName(r.FullName, r.Name, r.FullNameAlt)
	r.Email = strings.ToLower(strings.TrimSpace(r.Email))
	r.Role = normalizeRole(firstNonEmpty(r.Role, r.UserType, r.AccountType, r.RoleName))
}

type loginRequest struct {
	Email    string `json:"email"`
	Username string `json:"username"`
	Password string `json:"password"`
}

func (r *loginRequest) normalize() {
	r.Email = strings.ToLower(strings.TrimSpace(firstNonEmpty(r.Email, r.Username)))
	r.Password = strings.TrimSpace(r.Password)
}

func (h *AuthHandler) Register(c *gin.Context) {
	if h.Pool == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "database unavailable"})
		return
	}
	var req registerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	req.normalize()
	if strings.TrimSpace(req.FullName) == "" || len(req.FullName) < 2 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "full name is required"})
		return
	}
	if req.Email == "" || !strings.Contains(req.Email, "@") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "valid email is required"})
		return
	}
	if len(req.Password) < 8 || len(req.Password) > 72 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "password must be between 8 and 72 characters"})
		return
	}
	role := req.Role

	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()

	// check existing
	var exists bool
	err := h.Pool.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM users WHERE email=$1)`, req.Email).Scan(&exists)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}
	if exists {
		c.JSON(http.StatusConflict, gin.H{"error": "email already registered"})
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to hash password"})
		return
	}

	var id int
	err = h.Pool.QueryRow(ctx,
		`INSERT INTO users (full_name, email, password_hash, role) VALUES ($1,$2,$3,$4) RETURNING id`,
		strings.TrimSpace(req.FullName), req.Email, string(hash), role,
	).Scan(&id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create user: " + err.Error()})
		return
	}

	// audit
	_, _ = h.Pool.Exec(ctx, `INSERT INTO audit_logs (user_id, action, description) VALUES ($1,$2,$3)`,
		id, "user_register", "Registered with role "+role)

	token, err := auth.GenerateToken(id, req.Email, role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate token"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "account created successfully",
		"token":   token,
		"user": gin.H{
			"id":        id,
			"full_name": strings.TrimSpace(req.FullName),
			"email":     req.Email,
			"role":      role,
		},
	})
}

func (h *AuthHandler) Login(c *gin.Context) {
	if h.Pool == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "database unavailable"})
		return
	}
	var req loginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	req.normalize()
	if req.Email == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "email is required"})
		return
	}
	if req.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "password is required"})
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()

	var id int
	var fullName, email, hash, role string
	err := h.Pool.QueryRow(ctx,
		`SELECT id, full_name, email, password_hash, role FROM users WHERE email=$1`, req.Email,
	).Scan(&id, &fullName, &email, &hash, &role)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid email or password"})
		return
	}
	if err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid email or password"})
		return
	}

	token, err := auth.GenerateToken(id, email, role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate token"})
		return
	}

	_, _ = h.Pool.Exec(ctx, `INSERT INTO audit_logs (user_id, action, description) VALUES ($1,$2,$3)`,
		id, "user_login", "User logged in")

	c.JSON(http.StatusOK, gin.H{
		"message": "login successful",
		"token":   token,
		"user": gin.H{
			"id":        id,
			"full_name": fullName,
			"email":     email,
			"role":      role,
		},
	})
}

func (h *AuthHandler) Me(c *gin.Context) {
	uid, _ := c.Get("user_id")
	email, _ := c.Get("email")
	role, _ := c.Get("role")
	c.JSON(http.StatusOK, gin.H{
		"user": gin.H{
			"id":    uid,
			"email": email,
			"role":  role,
		},
	})
}
