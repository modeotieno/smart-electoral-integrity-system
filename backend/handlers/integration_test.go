//go:build integration

package handlers

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/modeotieno/smart-electoral-integrity-system/database"
)

// TestLiveAPI hits real DB if DATABASE_URL is set; skipped otherwise.
// Run with: go test -tags=integration -run TestLiveAPI -v
func TestLiveAPI_Pagination(t *testing.T) {
	if os.Getenv("DATABASE_URL") == "" && os.Getenv("SKIP_INTEGRATION") != "" {
		t.Skip("no DATABASE_URL, skipping live integration")
	}
	pool, err := database.Connect()
	if err != nil {
		t.Skipf("db not available: %v", err)
	}
	defer pool.Close()

	gin.SetMode(gin.TestMode)
	r := gin.New()
	h := &ResourceHandler{Pool: pool}
	r.GET("/api/elections", h.ListElections)
	r.GET("/api/candidates", h.ListCandidates)
	r.GET("/api/stations", h.ListStations)

	cases := []struct {
		path string
		key  string
	}{
		{"/api/elections?page=1&limit=2", "elections"},
		{"/api/candidates?page=1&limit=2", "candidates"},
		{"/api/stations?page=1&limit=2", "stations"},
	}
	for _, tc := range cases {
		w := httptest.NewRecorder()
		req := httptest.NewRequest("GET", tc.path, nil)
		r.ServeHTTP(w, req)
		if w.Code != http.StatusOK {
			t.Fatalf("%s: want 200 got %d body %s", tc.path, w.Code, w.Body.String())
		}
		var body map[string]json.RawMessage
		if err := json.Unmarshal(w.Body.Bytes(), &body); err != nil {
			t.Fatalf("%s: json %v", tc.path, err)
		}
		if _, ok := body[tc.key]; !ok {
			t.Fatalf("%s: missing key %s in %s", tc.path, tc.key, w.Body.String())
		}
		if _, ok := body["pagination"]; !ok {
			t.Fatalf("%s: missing pagination envelope", tc.path)
		}
		var pag struct {
			Page       int `json:"page"`
			Limit      int `json:"limit"`
			Total      int `json:"total"`
			TotalPages int `json:"total_pages"`
		}
		if err := json.Unmarshal(body["pagination"], &pag); err != nil {
			t.Fatalf("%s: pagination decode %v", tc.path, err)
		}
		if pag.Page != 1 || pag.Limit != 2 {
			t.Fatalf("%s: pag %+v", tc.path, pag)
		}
	}

	// search filter
	w := httptest.NewRecorder()
	req := httptest.NewRequest("GET", "/api/stations?search=Nairobi", nil)
	r.ServeHTTP(w, req)
	if w.Code != http.StatusOK {
		t.Fatalf("search: %d", w.Code)
	}
}
