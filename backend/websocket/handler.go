package websocket

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

// GorillaConn wraps gorilla/websocket.Conn to implement Connection interface
type GorillaConn struct {
	*websocket.Conn
}

func (gc *GorillaConn) ReadMessage() (int, []byte, error) {
	return gc.Conn.ReadMessage()
}

func (gc *GorillaConn) WriteMessage(messageType int, data []byte) error {
	return gc.Conn.WriteMessage(messageType, data)
}

func (gc *GorillaConn) Close() error {
	return gc.Conn.Close()
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		// TODO: In production, validate origin properly
		return true
	},
}

// HandleWebSocket handles new WebSocket connections
func HandleWebSocket(hub *Hub) gin.HandlerFunc {
	return func(c *gin.Context) {
		conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "websocket upgrade failed"})
			return
		}

		clientID := uuid.New().String()
		client := &Client{
			ID:   clientID,
			Conn: &GorillaConn{conn},
			Send: make(chan *WSMessage, 256),
			Pool: hub.pool,
			quit: make(chan bool),
		}

		hub.register <- client

		// Start read and write pumps
		go client.ReadPump(hub)
		go client.WritePump()

		// Send welcome message
		welcome := &WSMessage{
			Type: MsgSystemStatus,
			Data: map[string]interface{}{
				"client_id": clientID,
				"message":   "Connected to election live stream",
			},
		}
		select {
		case client.Send <- welcome:
		default:
		}
	}
}

// BroadcastResultUpdate sends a result update to all connected clients
func (hub *Hub) BroadcastResultUpdate(result ResultUpdate) {
	msg := &WSMessage{
		Type:      MsgResultUpdate,
		Data:      result,
		Timestamp: time.Now(),
	}
	hub.Broadcast(msg)
}

// BroadcastCandidateTally sends updated vote tallies
func (hub *Hub) BroadcastCandidateTally(tally CandidateTally) {
	msg := &WSMessage{
		Type:      MsgCandidateTally,
		Data:      tally,
		Timestamp: time.Now(),
	}
	hub.Broadcast(msg)
}

// Example: Call this after SubmitResult in handlers/results.go
// func NotifyResultSubmitted(hub *Hub, electionID, candidateID, stationID, votes int) {
//   hub.BroadcastResultUpdate(ResultUpdate{
//     ElectionID: electionID,
//     CandidateID: candidateID,
//     PollingStationID: stationID,
//     Votes: votes,
//   })
// }
