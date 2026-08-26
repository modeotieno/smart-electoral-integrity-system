package handlers

import (
	"context"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

type CRUDHandler struct {
	Pool *pgxpool.Pool
}

func (h *CRUDHandler) CreateElection(c *gin.Context) {
	if h.Pool == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "db unavailable"})
		return
	}
	var req struct {
		Name        string `json:"name" binding:"required,min=3,max=150"`
		Description string `json:"description" binding:"max=1000"`
		StartDate   string `json:"start_date" binding:"required"`
		EndDate     string `json:"end_date" binding:"required"`
		Status      string `json:"status"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	status := strings.TrimSpace(req.Status)
	if status == "" {
		status = "planned"
	}
	start, err1 := time.Parse(time.RFC3339, req.StartDate)
	end, err2 := time.Parse(time.RFC3339, req.EndDate)
	if err1 != nil || err2 != nil {
		// try date only
		start, err1 = time.Parse("2006-01-02", req.StartDate)
		end, err2 = time.Parse("2006-01-02", req.EndDate)
		if err1 != nil || err2 != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid date format, use RFC3339 or YYYY-MM-DD"})
			return
		}
	}
	if !end.After(start) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "end_date must be after start_date"})
		return
	}
	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()
	var id int
	err := h.Pool.QueryRow(ctx,
		`INSERT INTO elections (name, description, start_date, end_date, status) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
		strings.TrimSpace(req.Name), req.Description, start, end, status,
	).Scan(&id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create election: " + err.Error()})
		return
	}
	uid, _ := c.Get("user_id")
	_, _ = h.Pool.Exec(ctx, `INSERT INTO audit_logs (user_id, action, description, ip_address) VALUES ($1,$2,$3,$4)`,
		uid, "election_create", "Created election "+req.Name, c.ClientIP())
	c.JSON(http.StatusCreated, gin.H{"message": "election created", "id": id})
}

func (h *CRUDHandler) CreateCandidate(c *gin.Context) {
	if h.Pool == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "db unavailable"})
		return
	}
	var req struct {
		ElectionID int    `json:"election_id" binding:"required"`
		FullName   string `json:"full_name" binding:"required,min=2,max=150"`
		Party      string `json:"party"`
		Position   string `json:"position" binding:"required"`
		Manifesto  string `json:"manifesto"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()
	var exists bool
	_ = h.Pool.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM elections WHERE id=$1)`, req.ElectionID).Scan(&exists)
	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{"error": "election not found"})
		return
	}
	uid, _ := c.Get("user_id")
	var id int
	// admin creates directly approved candidate
	err := h.Pool.QueryRow(ctx,
		`INSERT INTO candidates (election_id, full_name, party, position, manifesto, status, user_id, approved_at, approved_by) VALUES ($1,$2,$3,$4,$5,'approved',$6,NOW(),$6) RETURNING id`,
		req.ElectionID, strings.TrimSpace(req.FullName), req.Party, req.Position, req.Manifesto, uid,
	).Scan(&id)
	if err != nil {
		// fallback without new columns
		err = h.Pool.QueryRow(ctx,
			`INSERT INTO candidates (election_id, full_name, party, position, manifesto) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
			req.ElectionID, strings.TrimSpace(req.FullName), req.Party, req.Position, req.Manifesto,
		).Scan(&id)
	}
	if err != nil {
		err = h.Pool.QueryRow(ctx,
			`INSERT INTO candidates (election_id, full_name, position) VALUES ($1,$2,$3) RETURNING id`,
			req.ElectionID, strings.TrimSpace(req.FullName), req.Position,
		).Scan(&id)
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create candidate: " + err.Error()})
		return
	}
	_, _ = h.Pool.Exec(ctx, `INSERT INTO audit_logs (user_id, action, description, ip_address) VALUES ($1,$2,$3,$4)`,
		uid, "candidate_create", "Created candidate "+req.FullName, c.ClientIP())
	c.JSON(http.StatusCreated, gin.H{"message": "candidate created", "id": id})
}

// ApplyCandidate lets any authenticated user (especially role=candidate) self-register as a candidate — creates pending application
func (h *CRUDHandler) ApplyCandidate(c *gin.Context) {
	if h.Pool == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "db unavailable"})
		return
	}
	var req struct {
		ElectionID int    `json:"election_id" binding:"required"`
		FullName   string `json:"full_name" binding:"required,min=2,max=150"`
		Party      string `json:"party"`
		Position   string `json:"position" binding:"required"`
		Manifesto  string `json:"manifesto"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()
	var exists bool
	_ = h.Pool.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM elections WHERE id=$1)`, req.ElectionID).Scan(&exists)
	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{"error": "election not found"})
		return
	}
	uidRaw, _ := c.Get("user_id")
	uid, _ := uidRaw.(int)
	// prevent duplicate pending/approved for same user+election
	var dup bool
	_ = h.Pool.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM candidates WHERE user_id=$1 AND election_id=$2 AND status IN ('pending','approved'))`, uid, req.ElectionID).Scan(&dup)
	if dup {
		c.JSON(http.StatusConflict, gin.H{"error": "you already have a pending or approved application for this election"})
		return
	}
	var id int
	name := strings.TrimSpace(req.FullName)
	if name == "" {
		// fallback to user's full_name
		_ = h.Pool.QueryRow(ctx, `SELECT full_name FROM users WHERE id=$1`, uid).Scan(&name)
	}
	err := h.Pool.QueryRow(ctx,
		`INSERT INTO candidates (election_id, full_name, party, position, manifesto, status, user_id) VALUES ($1,$2,$3,$4,$5,'pending',$6) RETURNING id`,
		req.ElectionID, name, req.Party, req.Position, req.Manifesto, uid,
	).Scan(&id)
	if err != nil {
		err = h.Pool.QueryRow(ctx,
			`INSERT INTO candidates (election_id, full_name, party, position, manifesto) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
			req.ElectionID, name, req.Party, req.Position, req.Manifesto,
		).Scan(&id)
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to apply: " + err.Error()})
		return
	}
	_, _ = h.Pool.Exec(ctx, `INSERT INTO audit_logs (user_id, action, description, ip_address) VALUES ($1,$2,$3,$4)`,
		uid, "candidate_apply", "Applied as candidate for election "+strings.TrimSpace(req.Party), c.ClientIP())
	c.JSON(http.StatusCreated, gin.H{"message": "application submitted, pending approval", "id": id, "status": "pending"})
}

func (h *CRUDHandler) UpdateCandidateStatus(c *gin.Context) {
	if h.Pool == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "db unavailable"})
		return
	}
	idStr := c.Param("id")
	candID, err := parseID(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid candidate id"})
		return
	}
	var req struct {
		Status          string `json:"status" binding:"required"`
		RejectionReason string `json:"rejection_reason"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	st := strings.ToLower(strings.TrimSpace(req.Status))
	if st != "approved" && st != "rejected" && st != "pending" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "status must be approved/rejected/pending"})
		return
	}
	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()
	uidRaw, _ := c.Get("user_id")
	uid, _ := uidRaw.(int)
	var tagTime = "NOW()"
	var q string
	if st == "approved" {
		q = `UPDATE candidates SET status='approved', approved_at=NOW(), approved_by=$1, rejection_reason=NULL WHERE id=$2`
	} else if st == "rejected" {
		q = `UPDATE candidates SET status='rejected', approved_by=$1, rejection_reason=$3 WHERE id=$2`
	} else {
		q = `UPDATE candidates SET status='pending', approved_by=NULL, approved_at=NULL, rejection_reason=NULL WHERE id=$2`
	}
	_ = tagTime
	var tag interface{}
	if st == "rejected" {
		t, err := h.Pool.Exec(ctx, q, uid, candID, req.RejectionReason)
		tag = t
		if err != nil {
			// fallback without new cols
			_, ferr := h.Pool.Exec(ctx, `UPDATE candidates SET status=$1 WHERE id=$2`, st, candID)
			if ferr != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "update failed: " + err.Error()})
				return
			}
			c.JSON(http.StatusOK, gin.H{"message": "candidate " + st})
			return
		}
		if t.RowsAffected() == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "candidate not found"})
			return
		}
		_ = tag
	} else {
		t, err := h.Pool.Exec(ctx, q, uid, candID)
		if err != nil {
			_, ferr := h.Pool.Exec(ctx, `UPDATE candidates SET status=$1 WHERE id=$2`, st, candID)
			if ferr != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "update failed: " + err.Error()})
				return
			}
			c.JSON(http.StatusOK, gin.H{"message": "candidate " + st})
			return
		}
		if t.RowsAffected() == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "candidate not found"})
			return
		}
	}
	_, _ = h.Pool.Exec(ctx, `INSERT INTO audit_logs (user_id, action, description) VALUES ($1,$2,$3)`, uid, "candidate_"+st, "candidate "+idStr+" -> "+st)
	c.JSON(http.StatusOK, gin.H{"message": "candidate " + st})
}

func parseID(s string) (int, error) {
	return strconv.Atoi(s)
}

func (h *CRUDHandler) CreateStation(c *gin.Context) {
	if h.Pool == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "db unavailable"})
		return
	}
	var req struct {
		Name             string `json:"name" binding:"required,min=2,max=150"`
		Location         string `json:"location" binding:"required"`
		County           string `json:"county"`
		RegisteredVoters int    `json:"registered_voters"`
		Status           string `json:"status"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if req.RegisteredVoters < 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "registered_voters must be >=0"})
		return
	}
	status := req.Status
	if status == "" {
		status = "active"
	}
	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()
	var id int
	err := h.Pool.QueryRow(ctx,
		`INSERT INTO polling_stations (name, location, county, registered_voters, status) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
		strings.TrimSpace(req.Name), req.Location, req.County, req.RegisteredVoters, status,
	).Scan(&id)
	if err != nil {
		// fallback for old schema without county/status
		err = h.Pool.QueryRow(ctx,
			`INSERT INTO polling_stations (name, location, registered_voters) VALUES ($1,$2,$3) RETURNING id`,
			strings.TrimSpace(req.Name), req.Location, req.RegisteredVoters,
		).Scan(&id)
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create station: " + err.Error()})
		return
	}
	uid, _ := c.Get("user_id")
	_, _ = h.Pool.Exec(ctx, `INSERT INTO audit_logs (user_id, action, description, ip_address) VALUES ($1,$2,$3,$4)`,
		uid, "station_create", "Created station "+req.Name, c.ClientIP())
	c.JSON(http.StatusCreated, gin.H{"message": "station created", "id": id})
}

func (h *ResourceHandler) ListUsers(c *gin.Context) {
	if h.Pool == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "db unavailable"})
		return
	}
	p := parsePagination(c)
	search := c.Query("search")
	roleFilter := c.Query("role")
	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()
	var total int
	_ = h.Pool.QueryRow(ctx, `SELECT COUNT(*) FROM users WHERE ($1='' OR full_name ILIKE '%'||$1||'%' OR email ILIKE '%'||$1||'%') AND ($2='' OR role=$2)`, search, roleFilter).Scan(&total)
	p.finalize(total)
	rows, err := h.Pool.Query(ctx, `SELECT id, full_name, email, role, biometric_enrolled, created_at FROM users WHERE ($1='' OR full_name ILIKE '%'||$1||'%' OR email ILIKE '%'||$1||'%') AND ($2='' OR role=$2) ORDER BY created_at DESC LIMIT $3 OFFSET $4`, search, roleFilter, p.Limit, p.Offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed"})
		return
	}
	defer rows.Close()
	var out []gin.H
	for rows.Next() {
		var id int
		var name, email, role string
		var enrolled *bool
		var created time.Time
		if err := rows.Scan(&id, &name, &email, &role, &enrolled, &created); err != nil {
			continue
		}
		en := false
		if enrolled != nil {
			en = *enrolled
		}
		out = append(out, gin.H{"id": id, "full_name": name, "email": email, "role": role, "biometric_enrolled": en, "created_at": created})
	}
	if out == nil {
		out = []gin.H{}
	}
	c.JSON(http.StatusOK, gin.H{"users": out, "data": out, "pagination": gin.H{"page": p.Page, "limit": p.Limit, "total": p.Total, "total_pages": p.TotalPages}})
}

func (h *CRUDHandler) CreateIncident(c *gin.Context) {
	if h.Pool == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "db unavailable"})
		return
	}
	var req struct {
		Title             string `json:"title" binding:"required,min=3,max=200"`
		Description       string `json:"description"`
		PollingStationID  *int   `json:"polling_station_id"`
		Severity          string `json:"severity"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	sev := strings.ToLower(strings.TrimSpace(req.Severity))
	if sev == "" {
		sev = "medium"
	}
	if sev != "low" && sev != "medium" && sev != "high" && sev != "critical" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "severity must be low/medium/high/critical"})
		return
	}
	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()
	uid, _ := c.Get("user_id")
	var id int
	err := h.Pool.QueryRow(ctx,
		`INSERT INTO incidents (title, description, polling_station_id, reported_by, severity) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
		req.Title, req.Description, req.PollingStationID, uid, sev,
	).Scan(&id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create incident: " + err.Error()})
		return
	}
	_, _ = h.Pool.Exec(ctx, `INSERT INTO audit_logs (user_id, action, description, ip_address) VALUES ($1,$2,$3,$4)`,
		uid, "incident_report", "Reported incident: "+req.Title, c.ClientIP())
	c.JSON(http.StatusCreated, gin.H{"message": "incident reported", "id": id})
}

func (h *CRUDHandler) ListIncidents(c *gin.Context) {
	if h.Pool == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "db unavailable"})
		return
	}
	p := parsePagination(c)
	search := c.Query("search")
	severity := c.Query("severity")
	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()
	var total int
	_ = h.Pool.QueryRow(ctx, `SELECT COUNT(*) FROM incidents WHERE ($1='' OR title ILIKE '%'||$1||'%' OR description ILIKE '%'||$1||'%') AND ($2='' OR severity=$2)`, search, severity).Scan(&total)
	p.finalize(total)
	rows, err := h.Pool.Query(ctx, `SELECT id, title, description, severity, status, reported_by, created_at FROM incidents WHERE ($1='' OR title ILIKE '%'||$1||'%' OR description ILIKE '%'||$1||'%') AND ($2='' OR severity=$2) ORDER BY created_at DESC LIMIT $3 OFFSET $4`, search, severity, p.Limit, p.Offset)
	if err != nil {
		// table may not exist yet in old DB
		c.JSON(http.StatusOK, gin.H{"incidents": []gin.H{}, "data": []gin.H{}, "pagination": gin.H{"page": p.Page, "limit": p.Limit, "total": p.Total, "total_pages": p.TotalPages}})
		return
	}
	defer rows.Close()
	var out []gin.H
	for rows.Next() {
		var id int
		var title, sev, status string
		var desc *string
		var reportedBy *int
		var created time.Time
		if err := rows.Scan(&id, &title, &desc, &sev, &status, &reportedBy, &created); err != nil {
			continue
		}
		d := ""
		if desc != nil {
			d = *desc
		}
		out = append(out, gin.H{"id": id, "title": title, "description": d, "severity": sev, "status": status, "reported_by": reportedBy, "created_at": created})
	}
	if out == nil {
		out = []gin.H{}
	}
	c.JSON(http.StatusOK, gin.H{"incidents": out, "data": out, "pagination": gin.H{"page": p.Page, "limit": p.Limit, "total": p.Total, "total_pages": p.TotalPages}})
}
