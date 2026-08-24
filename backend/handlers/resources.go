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
	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()
	rows, err := h.Pool.Query(ctx, `SELECT id, name, description, status, start_date, end_date, created_at FROM elections ORDER BY created_at DESC`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed"})
		return
	}
	defer rows.Close()
	var out []gin.H
	for rows.Next() {
		var id int
		var name, desc, status string
		var start, end, created time.Time
		// description may be null
		var descPtr *string
		rows.Scan(&id, &name, &descPtr, &status, &start, &end, &created)
		if descPtr != nil {
			desc = *descPtr
		}
		out = append(out, gin.H{"id": id, "name": name, "description": desc, "status": status, "start_date": start, "end_date": end})
	}
	if out == nil {
		out = []gin.H{}
	}
	c.JSON(http.StatusOK, gin.H{"elections": out})
}

func (h *ResourceHandler) ListCandidates(c *gin.Context) {
	if h.Pool == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "db unavailable"})
		return
	}
	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()
	rows, err := h.Pool.Query(ctx, `SELECT c.id, c.full_name, c.position, e.name as election_name FROM candidates c JOIN elections e ON c.election_id=e.id ORDER BY c.id`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed"})
		return
	}
	defer rows.Close()
	var out []gin.H
	for rows.Next() {
		var id int
		var name, pos, ename string
		rows.Scan(&id, &name, &pos, &ename)
		out = append(out, gin.H{"id": id, "full_name": name, "position": pos, "election": ename})
	}
	if out == nil {
		out = []gin.H{}
	}
	c.JSON(http.StatusOK, gin.H{"candidates": out})
}

func (h *ResourceHandler) ListStations(c *gin.Context) {
	if h.Pool == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "db unavailable"})
		return
	}
	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()
	rows, err := h.Pool.Query(ctx, `SELECT id, name, location, registered_voters FROM polling_stations ORDER BY id`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed"})
		return
	}
	defer rows.Close()
	var out []gin.H
	for rows.Next() {
		var id, voters int
		var name, loc string
		rows.Scan(&id, &name, &loc, &voters)
		out = append(out, gin.H{"id": id, "name": name, "location": loc, "registered_voters": voters})
	}
	if out == nil {
		out = []gin.H{}
	}
	c.JSON(http.StatusOK, gin.H{"stations": out})
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
	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()
	rows, err := h.Pool.Query(ctx, `SELECT user_id, action, description, created_at FROM audit_logs ORDER BY created_at DESC LIMIT 20`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed"})
		return
	}
	defer rows.Close()
	var out []gin.H
	for rows.Next() {
		var uid *int
		var action, desc string
		var created time.Time
		var descPtr *string
		rows.Scan(&uid, &action, &descPtr, &created)
		if descPtr != nil {
			desc = *descPtr
		}
		out = append(out, gin.H{"user_id": uid, "action": action, "description": desc, "created_at": created})
	}
	if out == nil {
		out = []gin.H{}
	}
	c.JSON(http.StatusOK, gin.H{"logs": out})
}
