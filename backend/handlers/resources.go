package handlers

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ResourceHandler struct {
	Pool *pgxpool.Pool
}

func (h *ResourceHandler) ListElections(c *gin.Context) {
	if h.Pool == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "db unavailable"})
		return
	}
	p := parsePagination(c)
	search := c.Query("search")
	statusFilter := c.Query("status")
	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()

	// count
	var total int
	countQ := `SELECT COUNT(*) FROM elections WHERE ($1='' OR name ILIKE '%'||$1||'%' OR description ILIKE '%'||$1||'%') AND ($2='' OR status=$2)`
	_ = h.Pool.QueryRow(ctx, countQ, search, statusFilter).Scan(&total)
	p.finalize(total)

	q := `SELECT id, name, description, status, start_date, end_date, created_at FROM elections
	      WHERE ($1='' OR name ILIKE '%'||$1||'%' OR description ILIKE '%'||$1||'%') AND ($2='' OR status=$2)
	      ORDER BY created_at DESC LIMIT $3 OFFSET $4`
	rows, err := h.Pool.Query(ctx, q, search, statusFilter, p.Limit, p.Offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed"})
		return
	}
	defer rows.Close()
	var out []gin.H
	for rows.Next() {
		var id int
		var name, status string
		var descPtr *string
		var start, end, created time.Time
		if err := rows.Scan(&id, &name, &descPtr, &status, &start, &end, &created); err != nil {
			continue
		}
		desc := ""
		if descPtr != nil {
			desc = *descPtr
		}
		out = append(out, gin.H{"id": id, "name": name, "description": desc, "status": status, "start_date": start, "end_date": end})
	}
	if out == nil {
		out = []gin.H{}
	}
	// paginated envelope + backward compat
	c.JSON(http.StatusOK, gin.H{
		"elections":  out,
		"data":       out,
		"pagination": gin.H{"page": p.Page, "limit": p.Limit, "total": p.Total, "total_pages": p.TotalPages},
	})
}

func (h *ResourceHandler) ListCandidates(c *gin.Context) {
	if h.Pool == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "db unavailable"})
		return
	}
	p := parsePagination(c)
	search := c.Query("search")
	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()
	var total int
	_ = h.Pool.QueryRow(ctx, `SELECT COUNT(*) FROM candidates c JOIN elections e ON c.election_id=e.id WHERE ($1='' OR c.full_name ILIKE '%'||$1||'%' OR c.party ILIKE '%'||$1||'%')`, search).Scan(&total)
	p.finalize(total)
	rows, err := h.Pool.Query(ctx, `SELECT c.id, c.full_name, c.party, c.position, e.name as election_name FROM candidates c JOIN elections e ON c.election_id=e.id WHERE ($1='' OR c.full_name ILIKE '%'||$1||'%' OR c.party ILIKE '%'||$1||'%') ORDER BY c.id LIMIT $2 OFFSET $3`, search, p.Limit, p.Offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed"})
		return
	}
	defer rows.Close()
	var out []gin.H
	for rows.Next() {
		var id int
		var name, party, pos, ename string
		var partyPtr *string
		if err := rows.Scan(&id, &name, &partyPtr, &pos, &ename); err != nil {
			continue
		}
		if partyPtr != nil {
			party = *partyPtr
		}
		out = append(out, gin.H{"id": id, "full_name": name, "party": party, "position": pos, "election": ename})
	}
	if out == nil {
		out = []gin.H{}
	}
	c.JSON(http.StatusOK, gin.H{"candidates": out, "data": out, "pagination": gin.H{"page": p.Page, "limit": p.Limit, "total": p.Total, "total_pages": p.TotalPages}})
}

func (h *ResourceHandler) ListStations(c *gin.Context) {
	if h.Pool == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "db unavailable"})
		return
	}
	p := parsePagination(c)
	search := c.Query("search")
	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()
	var total int
	_ = h.Pool.QueryRow(ctx, `SELECT COUNT(*) FROM polling_stations WHERE ($1='' OR name ILIKE '%'||$1||'%' OR location ILIKE '%'||$1||'%' OR county ILIKE '%'||$1||'%')`, search).Scan(&total)
	p.finalize(total)
	rows, err := h.Pool.Query(ctx, `SELECT id, name, location, county, registered_voters, status FROM polling_stations WHERE ($1='' OR name ILIKE '%'||$1||'%' OR location ILIKE '%'||$1||'%' OR county ILIKE '%'||$1||'%') ORDER BY id LIMIT $2 OFFSET $3`, search, p.Limit, p.Offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed"})
		return
	}
	defer rows.Close()
	var out []gin.H
	for rows.Next() {
		var id, voters int
		var name, loc, county, status string
		var countyPtr, statusPtr *string
		if err := rows.Scan(&id, &name, &loc, &countyPtr, &voters, &statusPtr); err != nil {
			continue
		}
		if countyPtr != nil {
			county = *countyPtr
		}
		if statusPtr != nil {
			status = *statusPtr
		}
		out = append(out, gin.H{"id": id, "name": name, "location": loc, "county": county, "registered_voters": voters, "status": status})
	}
	if out == nil {
		out = []gin.H{}
	}
	c.JSON(http.StatusOK, gin.H{"stations": out, "data": out, "pagination": gin.H{"page": p.Page, "limit": p.Limit, "total": p.Total, "total_pages": p.TotalPages}})
}

func (h *ResourceHandler) DashboardStats(c *gin.Context) {
	if h.Pool == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "db unavailable"})
		return
	}
	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()
	var users, elections, stations, candidates int
	var bioEnrolled int
	h.Pool.QueryRow(ctx, `SELECT COUNT(*) FROM users`).Scan(&users)
	h.Pool.QueryRow(ctx, `SELECT COUNT(*) FROM elections`).Scan(&elections)
	h.Pool.QueryRow(ctx, `SELECT COUNT(*) FROM polling_stations`).Scan(&stations)
	h.Pool.QueryRow(ctx, `SELECT COUNT(*) FROM candidates`).Scan(&candidates)
	h.Pool.QueryRow(ctx, `SELECT COUNT(*) FROM users WHERE biometric_enrolled=true`).Scan(&bioEnrolled)
	c.JSON(http.StatusOK, gin.H{
		"registered_voters": users,
		"elections":         elections,
		"polling_stations":  stations,
		"candidates":        candidates,
		"biometric_enrolled": bioEnrolled,
		"system_uptime":     "99.9%",
	})
}

func (h *ResourceHandler) AuditLogs(c *gin.Context) {
	if h.Pool == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "db unavailable"})
		return
	}
	p := parsePagination(c)
	if p.Limit == 10 {
		// default for audit logs is 20
		p.Limit = 20
		p.Offset = (p.Page - 1) * p.Limit
	}
	search := c.Query("search")
	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()
	var total int
	_ = h.Pool.QueryRow(ctx, `SELECT COUNT(*) FROM audit_logs WHERE ($1='' OR action ILIKE '%'||$1||'%' OR description ILIKE '%'||$1||'%')`, search).Scan(&total)
	p.finalize(total)
	rows, err := h.Pool.Query(ctx, `SELECT user_id, action, description, created_at FROM audit_logs WHERE ($1='' OR action ILIKE '%'||$1||'%' OR description ILIKE '%'||$1||'%') ORDER BY created_at DESC LIMIT $2 OFFSET $3`, search, p.Limit, p.Offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed"})
		return
	}
	defer rows.Close()
	var out []gin.H
	for rows.Next() {
		var uid *int
		var action string
		var descPtr *string
		var created time.Time
		if err := rows.Scan(&uid, &action, &descPtr, &created); err != nil {
			continue
		}
		desc := ""
		if descPtr != nil {
			desc = *descPtr
		}
		out = append(out, gin.H{"user_id": uid, "action": action, "description": desc, "created_at": created})
	}
	if out == nil {
		out = []gin.H{}
	}
	c.JSON(http.StatusOK, gin.H{"logs": out, "data": out, "pagination": gin.H{"page": p.Page, "limit": p.Limit, "total": p.Total, "total_pages": p.TotalPages}})
}
