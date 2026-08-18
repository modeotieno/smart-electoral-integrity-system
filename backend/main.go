package main

import (
	"context"
	"net/http"

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

	router.GET("/api/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":   "ok",
			"message":  "SEIS backend is running",
			"database": "connected",
		})
	})

	router.Run(":8080")
}
