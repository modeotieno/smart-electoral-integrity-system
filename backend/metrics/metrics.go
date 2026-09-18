package metrics

import (
	"sync"
	"time"
)

// MetricsCollector tracks system performance metrics during elections
type MetricsCollector struct {
	mu                    sync.RWMutex
	requestCount          int64
	errorCount            int64
	totalResponseTime     time.Duration
	queryDurations        []time.Duration
	websocketConnections  int
	websocketMessagesOut  int64
	maxResponseTime       time.Duration
	startTime             time.Time
}

// NewMetricsCollector creates a new metrics collector
func NewMetricsCollector() *MetricsCollector {
	return &MetricsCollector{
		queryDurations: make([]time.Duration, 0),
		startTime:      time.Now(),
	}
}

// RecordRequest tracks an HTTP request
func (m *MetricsCollector) RecordRequest(duration time.Duration, err error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	m.requestCount++
	m.totalResponseTime += duration
	if duration > m.maxResponseTime {
		m.maxResponseTime = duration
	}
	if err != nil {
		m.errorCount++
	}
}

// RecordQueryDuration tracks database query duration
func (m *MetricsCollector) RecordQueryDuration(duration time.Duration) {
	m.mu.Lock()
	defer m.mu.Unlock()

	m.queryDurations = append(m.queryDurations, duration)
	// Keep only last 1000 queries to prevent memory bloat
	if len(m.queryDurations) > 1000 {
		m.queryDurations = m.queryDurations[1:]
	}
}

// RecordWebSocketConnection tracks WebSocket connection
func (m *MetricsCollector) RecordWebSocketConnection() {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.websocketConnections++
}

// RecordWebSocketDisconnection tracks WebSocket disconnection
func (m *MetricsCollector) RecordWebSocketDisconnection() {
	m.mu.Lock()
	defer m.mu.Unlock()
	if m.websocketConnections > 0 {
		m.websocketConnections--
	}
}

// RecordWebSocketMessage tracks WebSocket message sent
func (m *MetricsCollector) RecordWebSocketMessage() {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.websocketMessagesOut++
}

// GetMetrics returns current metrics snapshot
func (m *MetricsCollector) GetMetrics() map[string]interface{} {
	m.mu.RLock()
	defer m.mu.RUnlock()

	avgResponseTime := time.Duration(0)
	if m.requestCount > 0 {
		avgResponseTime = m.totalResponseTime / time.Duration(m.requestCount)
	}

	avgQueryTime := time.Duration(0)
	if len(m.queryDurations) > 0 {
		total := time.Duration(0)
		for _, d := range m.queryDurations {
			total += d
		}
		avgQueryTime = total / time.Duration(len(m.queryDurations))
	}

	errorRate := 0.0
	if m.requestCount > 0 {
		errorRate = float64(m.errorCount) / float64(m.requestCount) * 100
	}

	return map[string]interface{}{
		"uptime":                   time.Since(m.startTime).String(),
		"total_requests":           m.requestCount,
		"total_errors":             m.errorCount,
		"error_rate_percent":       errorRate,
		"avg_response_time_ms":     float64(avgResponseTime.Milliseconds()),
		"max_response_time_ms":     float64(m.maxResponseTime.Milliseconds()),
		"avg_query_time_ms":        float64(avgQueryTime.Milliseconds()),
		"recent_queries":           len(m.queryDurations),
		"active_websockets":        m.websocketConnections,
		"websocket_messages_sent":  m.websocketMessagesOut,
	}
}

// Reset clears all metrics
func (m *MetricsCollector) Reset() {
	m.mu.Lock()
	defer m.mu.Unlock()

	m.requestCount = 0
	m.errorCount = 0
	m.totalResponseTime = 0
	m.queryDurations = make([]time.Duration, 0)
	m.websocketMessagesOut = 0
	m.maxResponseTime = 0
	m.startTime = time.Now()
}
