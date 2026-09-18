package handlers

import (
	"context"
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/modeotieno/smart-electoral-integrity-system/cache"
	"github.com/modeotieno/smart-electoral-integrity-system/websocket"
)

type ResultsHandler struct {
	Pool  *pgxpool.Pool
	Cache *cache.ResultCache
	Hub   *websocket.Hub
}

func (h *ResultsHandler) ListResults(c *gin.Context) {
	if h.Pool == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "db unavailable"})
		return
	}
	p := parsePagination(c)
	search := c.Query("search")
	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()
	var total int
	_ = h.Pool.QueryRow(ctx, `SELECT COUNT(*) FROM results r JOIN candidates c ON r.candidate_id=c.id JOIN polling_stations ps ON r.polling_station_id=ps.id WHERE ($1='' OR c.full_name ILIKE '%'||$1||'%' OR ps.name ILIKE '%'||$1||'%')`, search).Scan(&total)
	p.finalize(total)
	query := `
		SELECT r.id, r.election_id, e.name, c.full_name, ps.name, r.votes, r.verified, r.created_at
		FROM results r
		JOIN elections e ON r.election_id=e.id
		JOIN candidates c ON r.candidate_id=c.id
		JOIN polling_stations ps ON r.polling_station_id=ps.id
		WHERE ($1='' OR c.full_name ILIKE '%'||$1||'%' OR ps.name ILIKE '%'||$1||'%')
		ORDER BY r.created_at DESC LIMIT $2 OFFSET $3`
	rows, err := h.Pool.Query(ctx, query, search, p.Limit, p.Offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "query failed"})
		return
	}
	defer rows.Close()
	var out []gin.H
	for rows.Next() {
		var id, eid, votes int
		var ename, cname, pname string
		var verified bool
		var created time.Time
		if err := rows.Scan(&id, &eid, &ename, &cname, &pname, &votes, &verified, &created); err != nil {
			continue
		}
		out = append(out, gin.H{"id": id, "election_id": eid, "election": ename, "candidate": cname, "station": pname, "votes": votes, "verified": verified, "created_at": created})
	}
	if out == nil {
		out = []gin.H{}
	}
	// aggregate totals per candidate — use cache if available and fresh
	var totals []gin.H
	if h.Cache != nil {
		// Try to get from cache first (no election_id context in this query, so use stale check)
		cachedTallies := h.Cache.GetElectionTallies(0) // 0 = cross-election aggregate
		if len(cachedTallies) > 0 && !h.Cache.IsStale(0) {
			for _, tally := range cachedTallies {
				totals = append(totals, gin.H{"candidate": tally.CandidateName, "total_votes": tally.TotalVotes})
			}
		} else {
			// Cache miss or stale — query database
			aggQuery := `SELECT c.id, c.full_name, COALESCE(SUM(r.votes),0) FROM candidates c LEFT JOIN results r ON r.candidate_id=c.id GROUP BY c.id, c.full_name ORDER BY SUM(r.votes) DESC`
			aggRows, _ := h.Pool.Query(ctx, aggQuery)
			if aggRows != nil {
				defer aggRows.Close()
				var cacheTallies []*cache.CandidateTally
				for aggRows.Next() {
					var candID int
					var name string
					var total int
					if err := aggRows.Scan(&candID, &name, &total); err != nil {
						continue
					}
					totals = append(totals, gin.H{"candidate": name, "total_votes": total})
					cacheTallies = append(cacheTallies, &cache.CandidateTally{
						CandidateID:   candID,
						CandidateName: name,
						TotalVotes:    total,
						LastUpdated:   time.Now(),
					})
				}
				// Update cache
				if h.Cache != nil && len(cacheTallies) > 0 {
					h.Cache.SetBatch(0, cacheTallies)
				}
			}
		}
	} else {
		// No cache available, query directly
		aggQuery := `SELECT c.full_name, COALESCE(SUM(r.votes),0) FROM candidates c LEFT JOIN results r ON r.candidate_id=c.id GROUP BY c.id, c.full_name ORDER BY SUM(r.votes) DESC`
		aggRows, _ := h.Pool.Query(ctx, aggQuery)
		if aggRows != nil {
			defer aggRows.Close()
			for aggRows.Next() {
				var name string
				var total int
				aggRows.Scan(&name, &total)
				totals = append(totals, gin.H{"candidate": name, "total_votes": total})
			}
		}
	}
	if totals == nil {
		totals = []gin.H{}
	}
	c.JSON(http.StatusOK, gin.H{"results": out, "data": out, "pagination": gin.H{"page": p.Page, "limit": p.Limit, "total": p.Total, "total_pages": p.TotalPages}, "totals": totals})
}

func (h *ResultsHandler) SubmitResult(c *gin.Context) {
	if h.Pool == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "db unavailable"})
		return
	}
	var req struct {
		ElectionID       int `json:"election_id" binding:"required"`
		CandidateID      int `json:"candidate_id" binding:"required"`
		PollingStationID int `json:"polling_station_id" binding:"required"`
		Votes            int `json:"votes" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if req.Votes < 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "votes must be >=0"})
		return
	}
	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()
	uid, _ := c.Get("user_id")
	userID := uid.(int)
	// upsert: if same election/candidate/station exists, update votes
	var id int
	err := h.Pool.QueryRow(ctx, `
		INSERT INTO results (election_id, candidate_id, polling_station_id, votes, submitted_by)
		VALUES ($1,$2,$3,$4,$5)
		ON CONFLICT (election_id, candidate_id, polling_station_id) DO UPDATE SET votes=EXCLUDED.votes, submitted_by=EXCLUDED.submitted_by, verified=false
		RETURNING id
	`, req.ElectionID, req.CandidateID, req.PollingStationID, req.Votes, userID).Scan(&id)
	if err != nil {
		// fallback without unique constraint
		err = h.Pool.QueryRow(ctx,
			`INSERT INTO results (election_id, candidate_id, polling_station_id, votes, submitted_by) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
			req.ElectionID, req.CandidateID, req.PollingStationID, req.Votes, userID).Scan(&id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to submit result: " + err.Error()})
			return
		}
	}
	_, _ = h.Pool.Exec(ctx, `INSERT INTO audit_logs (user_id, action, description, ip_address) VALUES ($1,$2,$3,$4)`,
		userID, "result_submit", "Submitted result votes="+strconv.Itoa(req.Votes), c.ClientIP())

	// invalidate cached tallies so the next read recomputes fresh aggregates
	if h.Cache != nil {
		h.Cache.Clear(req.ElectionID)
		h.Cache.Clear(0)
	}

	// push live update to connected WebSocket clients
	if h.Hub != nil {
		h.Hub.BroadcastResultUpdate(websocket.ResultUpdate{
			ResultID:         id,
			ElectionID:       req.ElectionID,
			CandidateID:      req.CandidateID,
			PollingStationID: req.PollingStationID,
			Votes:            req.Votes,
			Verified:         false,
		})
		var candName string
		_ = h.Pool.QueryRow(ctx, `SELECT full_name FROM candidates WHERE id=$1`, req.CandidateID).Scan(&candName)
		var totalVotes int
		_ = h.Pool.QueryRow(ctx, `SELECT COALESCE(SUM(votes),0) FROM results WHERE candidate_id=$1`, req.CandidateID).Scan(&totalVotes)
		h.Hub.BroadcastCandidateTally(websocket.CandidateTally{
			CandidateName: candName,
			TotalVotes:    totalVotes,
			ElectionID:    req.ElectionID,
		})
	}

	c.JSON(http.StatusCreated, gin.H{"message": "result submitted", "id": id})
}

func (h *ResultsHandler) VerifyResult(c *gin.Context) {
	if h.Pool == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "db unavailable"})
		return
	}
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()
	uid, _ := c.Get("user_id")
	userID := uid.(int)
	var electionID, candidateID, stationID, votes int
	err = h.Pool.QueryRow(ctx, `UPDATE results SET verified=true, verified_by=$1, verified_at=NOW() WHERE id=$2 RETURNING election_id, candidate_id, polling_station_id, votes`,
		userID, id).Scan(&electionID, &candidateID, &stationID, &votes)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "result not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to verify"})
		}
		return
	}
	_, _ = h.Pool.Exec(ctx, `INSERT INTO audit_logs (user_id, action, description, ip_address) VALUES ($1,$2,$3,$4)`,
		userID, "result_verify", "Verified result id="+idStr, c.ClientIP())

	// invalidate cached tallies so the next read recomputes fresh aggregates
	if h.Cache != nil {
		h.Cache.Clear(electionID)
		h.Cache.Clear(0)
	}

	// push live update to connected WebSocket clients
	if h.Hub != nil {
		h.Hub.BroadcastResultUpdate(websocket.ResultUpdate{
			ResultID:         id,
			ElectionID:       electionID,
			CandidateID:      candidateID,
			PollingStationID: stationID,
			Votes:            votes,
			Verified:         true,
		})
	}

	c.JSON(http.StatusOK, gin.H{"message": "result verified"})
}
