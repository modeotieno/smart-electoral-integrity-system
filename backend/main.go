package main

import (
	"context"
	"net/http"
	"os"
	"strings"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"github.com/modeotieno/smart-electoral-integrity-system/database"
	"github.com/modeotieno/smart-electoral-integrity-system/handlers"
	"github.com/modeotieno/smart-electoral-integrity-system/middleware"
)

func splitAndTrim(s, sep string) []string {
	parts := strings.Split(s, sep)
	for i, p := range parts {
		parts[i] = strings.TrimSpace(p)
	}
	return parts
}

func validateEnv() {
	jwtSecret := os.Getenv("JWT_SECRET")
	if os.Getenv("GIN_MODE") == "release" && (jwtSecret == "" || jwtSecret == "seis-ultra-secure-jwt-change-me" || jwtSecret == "change-this-to-a-strong-random-secret-in-production" || len(jwtSecret) < 16) {
		gin.DefaultWriter.Write([]byte("WARNING: JWT_SECRET is weak or default in release mode — set a strong 32+ char secret\n"))
	}
	if os.Getenv("DATABASE_URL") == "" {
		gin.DefaultWriter.Write([]byte("WARNING: DATABASE_URL not set, using default\n"))
	}
}

func main() {
	validateEnv()
	pool, err := database.ConnectWithRetry()
	if err != nil {
		gin.DefaultWriter.Write([]byte("WARNING: Database connection failed after retries: " + err.Error() + "\n"))
	} else {
		defer pool.Close()
		_ = pool.Ping(context.Background())
		gin.DefaultWriter.Write([]byte("INFO: Database connected successfully\n"))
	}

	router := gin.Default()
	router.Use(middleware.SecurityHeaders())

	// Enable CORS for your React app
	allowedOrigins := []string{"http://localhost:5173", "http://localhost:3000"}
	if v := os.Getenv("CORS_ORIGINS"); v != "" {
		// support comma-separated list
		allowedOrigins = []string{}
		for _, o := range splitAndTrim(v, ",") {
			if o != "" {
				allowedOrigins = append(allowedOrigins, o)
			}
		}
	}
	router.Use(cors.New(cors.Config{
		AllowOrigins:     allowedOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	router.GET("/api/health", func(c *gin.Context) {
		dbStatus := "disconnected"
		if pool != nil {
			if err := pool.Ping(c.Request.Context()); err == nil {
				dbStatus = "connected"
			}
		}
		c.JSON(http.StatusOK, gin.H{
			"status":   "ok",
			"message":  "SEIS backend is running",
			"database": dbStatus,
		})
	})

	// Auth routes — connects frontend Register / Login
	authHandler := &handlers.AuthHandler{Pool: pool}
	router.POST("/api/auth/register", authHandler.Register)
	router.POST("/api/auth/login", authHandler.Login)
	router.GET("/api/auth/me", middleware.RequireAuth(), authHandler.Me)

	// Biometric routes — advanced functional
	bioHandler := &handlers.BiometricHandler{Pool: pool}
	router.POST("/api/biometric/enroll", middleware.RequireAuth(), bioHandler.Enroll)
	router.POST("/api/biometric/verify", bioHandler.Verify)
	router.GET("/api/biometric/status", middleware.RequireAuth(), bioHandler.Status)

	// Resource routes — elections, candidates, stations, stats
	resHandler := &handlers.ResourceHandler{Pool: pool}
	crudHandler := &handlers.CRUDHandler{Pool: pool}
	resultsHandler := &handlers.ResultsHandler{Pool: pool}
	router.GET("/api/elections", resHandler.ListElections)
	router.GET("/api/candidates", resHandler.ListCandidates)
	router.GET("/api/stations", resHandler.ListStations)
	router.GET("/api/stats", resHandler.DashboardStats)
	router.GET("/api/audit-logs", middleware.RequireAuth(), resHandler.AuditLogs)
	router.GET("/api/users", middleware.RequireAuth(), resHandler.ListUsers)
	router.GET("/api/results", resultsHandler.ListResults)

	// Protected write routes
	router.POST("/api/elections", middleware.RequireAuth(), middleware.RequireRole("election_administrator", "returning_officer", "presiding_officer"), crudHandler.CreateElection)
	router.POST("/api/candidates", middleware.RequireAuth(), middleware.RequireRole("election_administrator", "returning_officer"), crudHandler.CreateCandidate)
	router.POST("/api/stations", middleware.RequireAuth(), middleware.RequireRole("election_administrator", "returning_officer"), crudHandler.CreateStation)
	router.POST("/api/results", middleware.RequireAuth(), middleware.RequireRole("presiding_officer", "returning_officer", "election_administrator"), resultsHandler.SubmitResult)
	router.POST("/api/results/:id/verify", middleware.RequireAuth(), middleware.RequireRole("returning_officer", "election_administrator"), resultsHandler.VerifyResult)
	router.POST("/api/incidents", middleware.RequireAuth(), crudHandler.CreateIncident)
	router.GET("/api/incidents", middleware.RequireAuth(), crudHandler.ListIncidents)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	router.Run(":" + port)
}