package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/modeotieno/smart-electoral-integrity-system/auth"
)

func TestRequireAuth_MissingHeader(t *testing.T) {
	gin.SetMode(gin.TestMode)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest("GET", "/", nil)
	RequireAuth()(c)
	if w.Code != http.StatusUnauthorized {
		t.Fatalf("want 401 got %d", w.Code)
	}
}

func TestRequireAuth_InvalidFormat(t *testing.T) {
	gin.SetMode(gin.TestMode)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest("GET", "/", nil)
	c.Request.Header.Set("Authorization", "BadFormat token")
	RequireAuth()(c)
	if w.Code != http.StatusUnauthorized {
		t.Fatalf("want 401 got %d", w.Code)
	}
}

func TestRequireAuth_ValidToken(t *testing.T) {
	gin.SetMode(gin.TestMode)
	token, _ := auth.GenerateToken(99, "user@test.com", "citizen")
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest("GET", "/", nil)
	c.Request.Header.Set("Authorization", "Bearer "+token)
	called := false
	handler := RequireAuth()
	// chain: set Next to mark called
	c.Set("next_called", false)
	handler(c)
	if w.Code == http.StatusUnauthorized {
		t.Fatalf("should be authorized, got 401")
	}
	// after RequireAuth success, context should have user_id
	if v, ok := c.Get("user_id"); !ok || v.(int) != 99 {
		t.Fatalf("user_id not set: %v ok %v", v, ok)
	}
	if v, ok := c.Get("role"); !ok || v.(string) != "citizen" {
		t.Fatalf("role not set")
	}
	_ = called
}

func TestRequireRole_AllowedAndDenied(t *testing.T) {
	gin.SetMode(gin.TestMode)
	tests := []struct {
		role    string
		allowed bool
	}{
		{"election_administrator", true},
		{"returning_officer", true},
		{"citizen", false},
		{"observer", false},
	}
	for _, tc := range tests {
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Set("role", tc.role)
		RequireRole("election_administrator", "returning_officer")(c)
		isForbidden := w.Code == http.StatusForbidden
		if tc.allowed && isForbidden {
			t.Fatalf("role %s should be allowed", tc.role)
		}
		if !tc.allowed && !isForbidden {
			t.Fatalf("role %s should be forbidden", tc.role)
		}
	}
}

func TestSecurityHeaders(t *testing.T) {
	gin.SetMode(gin.TestMode)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest("GET", "/", nil)
	SecurityHeaders()(c)
	if w.Header().Get("X-Content-Type-Options") != "nosniff" {
		t.Fatalf("missing header")
	}
	if w.Header().Get("X-Frame-Options") != "DENY" {
		t.Fatalf("missing frame")
	}
}
