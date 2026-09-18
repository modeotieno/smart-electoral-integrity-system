package middleware

import (
	"time"

	"github.com/gin-gonic/gin"
	"github.com/modeotieno/smart-electoral-integrity-system/metrics"
)

// MetricsMiddleware records request metrics
func MetricsMiddleware(collector *metrics.MetricsCollector) gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()

		c.Next()

		duration := time.Since(start)
		err := c.Errors.Last()
		collector.RecordRequest(duration, err)

		// Log slow requests (> 500ms)
		if duration > 500*time.Millisecond {
			c.Header("X-Response-Time-Ms", duration.String())
		}
	}
}
