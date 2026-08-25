package handlers

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

type BiometricHandler struct {
	Pool *pgxpool.Pool
}

type enrollRequest struct {
	BiometricType string `json:"biometric_type" binding:"required"` // fingerprint, face, iris
	BiometricData string `json:"biometric_data" binding:"required"` // base64 or raw string simulated
}

type verifyRequest struct {
	Email         string `json:"email" binding:"required,email"`
	BiometricData string `json:"biometric_data" binding:"required"`
}

// hash the biometric data to store securely (demo: sha256, in prod use secure enclave)
func hashBio(data string) string {
	h := sha256.Sum256([]byte(strings.TrimSpace(data)))
	return hex.EncodeToString(h[:])
}

func (h *BiometricHandler) Enroll(c *gin.Context) {
	if h.Pool == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "database unavailable"})
		return
	}
	uid, _ := c.Get("user_id")
	userID := uid.(int)
	var req enrollRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	btype := strings.ToLower(strings.TrimSpace(req.BiometricType))
	if btype != "fingerprint" && btype != "face" && btype != "iris" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "biometric_type must be fingerprint, face or iris"})
		return
	}
	hash := hashBio(req.BiometricData)
	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()
	_, err := h.Pool.Exec(ctx, `UPDATE users SET biometric_type=$1, biometric_hash=$2, biometric_enrolled=true, biometric_enrolled_at=NOW() WHERE id=$3`, btype, hash, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to enroll biometric"})
		return
	}
	_, _ = h.Pool.Exec(ctx, `INSERT INTO audit_logs (user_id, action, description) VALUES ($1,$2,$3)`, userID, "biometric_enroll", "Enrolled "+btype)
	c.JSON(http.StatusOK, gin.H{"message": "biometric enrolled successfully", "biometric_type": btype})
}

func (h *BiometricHandler) Verify(c *gin.Context) {
	if h.Pool == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "database unavailable"})
		return
	}
	var req verifyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	req.Email = strings.ToLower(strings.TrimSpace(req.Email))
	hash := hashBio(req.BiometricData)
	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()
	var stored *string
	var enrolled *bool
	err := h.Pool.QueryRow(ctx, `SELECT biometric_hash, biometric_enrolled FROM users WHERE email=$1`, req.Email).Scan(&stored, &enrolled)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found or biometric not enrolled"})
		return
	}
	if enrolled == nil || !*enrolled || stored == nil || *stored == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "biometric not enrolled for this user"})
		return
	}
	if *stored != hash {
		c.JSON(http.StatusUnauthorized, gin.H{"verified": false, "error": "biometric mismatch"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"verified": true, "message": "biometric verified"})
}

func (h *BiometricHandler) Status(c *gin.Context) {
	if h.Pool == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "database unavailable"})
		return
	}
	uid, _ := c.Get("user_id")
	userID := uid.(int)
	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()
	var btype, hash *string
	var enrolled *bool
	var enrolledAt *time.Time
	err := h.Pool.QueryRow(ctx, `SELECT biometric_type, biometric_hash, biometric_enrolled, biometric_enrolled_at FROM users WHERE id=$1`, userID).Scan(&btype, &hash, &enrolled, &enrolledAt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch status"})
		return
	}
	btypeVal := "none"
	if btype != nil {
		btypeVal = *btype
	}
	enrolledVal := false
	if enrolled != nil {
		enrolledVal = *enrolled
	}
	hashVal := ""
	if hash != nil {
		hashVal = *hash
	}
	c.JSON(http.StatusOK, gin.H{
		"biometric_type": btypeVal,
		"enrolled":       enrolledVal,
		"enrolled_at":    enrolledAt,
		"hash_preview":   previewHash(hashVal),
	})
}

func previewHash(h string) string {
	if len(h) > 12 {
		return h[:12] + "..."
	}
	return h
}
