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

func main() {
	pool, err := database.ConnectWithRetry()
	if err != nil {
		gin.DefaultWriter.Write([]byte("WARNING: Database connection failed after retries: " + err.Error() + "\n"))
	} else {
		defer pool.Close()
		_ = pool.Ping(context.Background())
		gin.DefaultWriter.Write([]byte("INFO: Database connected successfully\n"))
	}

	router := gin.Default()

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
	router.GET("/api/elections", resHandler.ListElections)
	router.GET("/api/candidates", resHandler.ListCandidates)
	router.GET("/api/stations", resHandler.ListStations)
	router.GET("/api/stats", resHandler.DashboardStats)
	router.GET("/api/audit-logs", middleware.RequireAuth(), resHandler.AuditLogs)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	router.Run(":" + port)
}