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
	"citizen":               true,
	"voter":                 true,
	"observer":              true,
	"candidate":             true,
	"presiding_officer":     true,
	"returning_officer":     true,
	"election_administrator": true,
}

func normalizeRole(r string) string {
	r = strings.ToLower(strings.TrimSpace(r))
	if r == "" {
		return "citizen"
	}
	// map common UI labels
	switch r {
	case "citizen", "voter":
		return "citizen"
	case "election observer", "observer":
		return "observer"
	case "candidate":
		return "candidate"
	case "presiding officer":
		return "presiding_officer"
	case "returning officer":
		return "returning_officer"
	case "election administrator", "admin":
		return "election_administrator"
	}
	if allowedRoles[r] {
		return r
	}
	return "citizen"
}

type registerRequest struct {
	FullName string `json:"full_name" binding:"required,min=2,max=150"`
	Email    string `json:"email" binding:"required,email,max=150"`
	Password string `json:"password" binding:"required,min=8,max=72"`
	Role     string `json:"role"`
}

type loginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
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
	req.Email = strings.ToLower(strings.TrimSpace(req.Email))
	role := normalizeRole(req.Role)

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
	req.Email = strings.ToLower(strings.TrimSpace(req.Email))

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
