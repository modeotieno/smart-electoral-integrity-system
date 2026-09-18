package websocket

import (
	"context"
	"log"
	"sync"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/modeotieno/smart-electoral-integrity-system/metrics"
)

// Message types for WebSocket communication
type MessageType string

const (
	MsgResultUpdate   MessageType = "result_update"
	MsgCandidateTally MessageType = "candidate_tally"
	MsgSystemStatus   MessageType = "system_status"
	MsgSubscribeReq   MessageType = "subscribe"
	MsgUnsubscribeReq MessageType = "unsubscribe"
)

type WSMessage struct {
	Type    MessageType `json:"type"`
	Data    interface{} `json:"data"`
	Timestamp time.Time `json:"timestamp"`
}

type ResultUpdate struct {
	ResultID        int    `json:"result_id"`
	ElectionID      int    `json:"election_id"`
	CandidateID     int    `json:"candidate_id"`
	PollingStationID int   `json:"polling_station_id"`
	Votes           int    `json:"votes"`
	Verified        bool   `json:"verified"`
}

type CandidateTally struct {
	CandidateName string `json:"candidate_name"`
	TotalVotes    int    `json:"total_votes"`
	ElectionID    int    `json:"election_id"`
}

type SystemStatusMsg struct {
	ConnectedClients int       `json:"connected_clients"`
	ResultsStreamed  int64     `json:"results_streamed"`
	Uptime           string    `json:"uptime"`
	LastUpdate       time.Time `json:"last_update"`
}

// Client represents a WebSocket connection
type Client struct {
	ID       string
	Conn     Connection
	Send     chan *WSMessage
	Pool     *pgxpool.Pool
	Mu       sync.RWMutex
	SubElID  int // subscribed election ID
	quit     chan bool
}

// Hub manages all WebSocket connections and broadcasts
type Hub struct {
	clients      map[string]*Client
	register     chan *Client
	unregister   chan *Client
	broadcast    chan *WSMessage
	mu           sync.RWMutex
	pool         *pgxpool.Pool
	metrics      *metrics.MetricsCollector
	startTime    time.Time
	streamCount  int64
}

// NewHub creates a new WebSocket hub
func NewHub(pool *pgxpool.Pool, collector *metrics.MetricsCollector) *Hub {
	return &Hub{
		clients:    make(map[string]*Client),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		broadcast:  make(chan *WSMessage, 100),
		pool:       pool,
		metrics:    collector,
		startTime:  time.Now(),
	}
}

// Run starts the hub's event loop
func (h *Hub) Run(ctx context.Context) {
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			h.mu.Lock()
			for _, client := range h.clients {
				close(client.Send)
			}
			h.mu.Unlock()
			return

		case client := <-h.register:
			h.mu.Lock()
			h.clients[client.ID] = client
			h.mu.Unlock()
			if h.metrics != nil {
				h.metrics.RecordWebSocketConnection()
			}
			log.Printf("[WS] Client registered: %s (total: %d)\n", client.ID, len(h.clients))

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client.ID]; ok {
				delete(h.clients, client.ID)
				close(client.Send)
			}
			h.mu.Unlock()
			if h.metrics != nil {
				h.metrics.RecordWebSocketDisconnection()
			}
			log.Printf("[WS] Client unregistered: %s (total: %d)\n", client.ID, len(h.clients))

		case msg := <-h.broadcast:
			h.mu.RLock()
			for _, client := range h.clients {
				select {
				case client.Send <- msg:
					if h.metrics != nil {
						h.metrics.RecordWebSocketMessage()
					}
				default:
					// Client's send channel is full, skip
				}
			}
			h.mu.RUnlock()
			h.streamCount++

		case <-ticker.C:
			// Periodically broadcast system status
			h.mu.RLock()
			status := SystemStatusMsg{
				ConnectedClients: len(h.clients),
				ResultsStreamed:  h.streamCount,
				Uptime:           time.Since(h.startTime).String(),
				LastUpdate:       time.Now(),
			}
			h.mu.RUnlock()

			msg := &WSMessage{
				Type:      MsgSystemStatus,
				Data:      status,
				Timestamp: time.Now(),
			}
			select {
			case h.broadcast <- msg:
			default:
			}
		}
	}
}

// Broadcast sends a message to all connected clients
func (h *Hub) Broadcast(msg *WSMessage) {
	select {
	case h.broadcast <- msg:
	default:
		log.Println("[WS] Broadcast channel full, dropped message")
	}
}

// GetClientCount returns the number of connected clients
func (h *Hub) GetClientCount() int {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return len(h.clients)
}
