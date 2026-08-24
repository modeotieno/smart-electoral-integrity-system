package main

import (
	"context"
	"net/http"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"github.com/modeotieno/smart-electoral-integrity-system/database"
)

func main() {
	pool, err := database.Connect()
	if err != nil {
		// Allow backend to start without DB for healthcheck/dev; log instead of panic
		// Change to panic in production if DB is mandatory
		gin.DefaultWriter.Write([]byte("WARNING: Database connection failed: " + err.Error() + "\n"))
	} else {
		defer pool.Close()
		// Verify pool still alive via context
		_ = pool.Ping(context.Background())
	}

	router := gin.Default()

	// Enable CORS for your React app
	allowedOrigins := []string{"http://localhost:5173", "http://localhost:3000"}
	if v := os.Getenv("CORS_ORIGINS"); v != "" {
		allowedOrigins = []string{v}
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

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	router.Run(":" + port)
}