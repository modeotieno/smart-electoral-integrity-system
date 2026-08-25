package handlers

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestParsePagination_Defaults(t *testing.T) {
	gin.SetMode(gin.TestMode)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest("GET", "/", nil)
	p := parsePagination(c)
	if p.Page != 1 || p.Limit != 10 || p.Offset != 0 {
		t.Fatalf("defaults: got page=%d limit=%d offset=%d", p.Page, p.Limit, p.Offset)
	}
}

func TestParsePagination_Custom(t *testing.T) {
	gin.SetMode(gin.TestMode)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest("GET", "/?page=3&limit=5", nil)
	p := parsePagination(c)
	if p.Page != 3 || p.Limit != 5 || p.Offset != 10 {
		t.Fatalf("custom: got %+v", p)
	}
}

func TestParsePagination_CapsAndAliases(t *testing.T) {
	gin.SetMode(gin.TestMode)
	cases := []struct {
		url       string
		wantLimit int
	}{
		{"/?limit=200", 100},
		{"/?page_size=20", 20},
		{"/?per_page=15", 15},
		{"/?page=0&limit=0", 10},
		{"/?page=-5&limit=-2", 10},
	}
	for _, tc := range cases {
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Request = httptest.NewRequest("GET", tc.url, nil)
		p := parsePagination(c)
		if p.Limit != tc.wantLimit {
			t.Fatalf("url %s: want limit %d got %d", tc.url, tc.wantLimit, p.Limit)
		}
	}
}

func TestPaginationFinalize(t *testing.T) {
	p := Pagination{Page: 2, Limit: 10, Offset: 10}
	p.finalize(25)
	if p.Total != 25 || p.TotalPages != 3 {
		t.Fatalf("finalize: got %+v", p)
	}
	p2 := Pagination{Page: 1, Limit: 10, Offset: 0}
	p2.finalize(0)
	if p2.TotalPages != 0 {
		t.Fatalf("empty: got %+v", p2)
	}
}

func TestPaginatedResponseShape(t *testing.T) {
	p := Pagination{Page: 1, Limit: 10, Offset: 0, Total: 2, TotalPages: 1}
	resp := paginatedResponse([]string{"a"}, p)
	if resp["data"] == nil || resp["pagination"] == nil {
		t.Fatalf("shape: got %+v", resp)
	}
	_ = http.StatusOK
}
