package handlers

import (
	"strconv"

	"github.com/gin-gonic/gin"
)

// Pagination holds parsed page/limit and computed offset/total pages.
type Pagination struct {
	Page       int `json:"page"`
	Limit      int `json:"limit"`
	Offset     int `json:"offset"`
	Total      int `json:"total"`
	TotalPages int `json:"total_pages"`
}

// parsePagination reads ?page=&limit= (also ?page_size=&per_page=), applies defaults and caps.
// Defaults: page=1, limit=10, max limit=100.
func parsePagination(c *gin.Context) Pagination {
	pageStr := c.Query("page")
	limitStr := c.Query("limit")
	if limitStr == "" {
		limitStr = c.Query("page_size")
	}
	if limitStr == "" {
		limitStr = c.Query("per_page")
	}
	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 {
		limit = 10
	}
	if limit > 100 {
		limit = 100
	}
	return Pagination{
		Page:   page,
		Limit:  limit,
		Offset: (page - 1) * limit,
	}
}

func (p *Pagination) finalize(total int) {
	p.Total = total
	if p.Limit > 0 {
		p.TotalPages = (total + p.Limit - 1) / p.Limit
	}
}

// paginatedResponse is the standard envelope for list endpoints.
func paginatedResponse(items interface{}, p Pagination) gin.H {
	return gin.H{
		"data": items,
		"pagination": gin.H{
			"page":        p.Page,
			"limit":       p.Limit,
			"total":       p.Total,
			"total_pages": p.TotalPages,
		},
	}
}
