package main

import (
	"context"
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"github.com/modeotieno/smart-electoral-integrity-system/database"
)

func main() {
	db, err := database.Connect()
	if err != nil {
		panic("Database connection failed: " + err.Error())
	}

	defer db.Close(context.Background())

	router := gin.Default()

	// Enable CORS for your React app
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:3000"}, // Common React dev ports
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	router.GET("/api/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":   "ok",
			"message":  "SEIS backend is running",
			"database": "connected",
		})
	})

	router.Run(":8080")
}