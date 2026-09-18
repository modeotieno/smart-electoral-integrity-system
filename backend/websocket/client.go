package websocket

import (
	"encoding/json"
	"io"
)

// Connection interface abstracts gorilla/websocket for testability
type Connection interface {
	ReadMessage() (messageType int, data []byte, err error)
	WriteMessage(messageType int, data []byte) error
	Close() error
}

// ReadPump handles incoming WebSocket messages
func (c *Client) ReadPump(hub *Hub) {
	defer func() {
		hub.unregister <- c
		c.Conn.Close()
	}()

	c.Conn.ReadMessage() // Ensure connection is active

	for {
		select {
		case <-c.quit:
			c.Conn.WriteMessage(1, nil)
			return
		default:
		}

		messageType, data, err := c.Conn.ReadMessage()
		if err != nil {
			if err != io.EOF {
				//log.Println("[WS] ReadMessage error:", err)
			}
			return
		}

		if messageType != 1 { // Text frame
			continue
		}

		var msg struct {
			Type       MessageType `json:"type"`
			ElectionID int         `json:"election_id"`
		}

		if err := json.Unmarshal(data, &msg); err != nil {
			continue
		}

		switch msg.Type {
		case MsgSubscribeReq:
			c.Mu.Lock()
			c.SubElID = msg.ElectionID
			c.Mu.Unlock()
			//log.Printf("[WS] Client %s subscribed to election %d\n", c.ID, msg.ElectionID)

		case MsgUnsubscribeReq:
			c.Mu.Lock()
			c.SubElID = 0
			c.Mu.Unlock()
		}
	}
}

// WritePump sends queued messages to the WebSocket
func (c *Client) WritePump() {
	defer c.Conn.Close()

	for {
		select {
		case msg, ok := <-c.Send:
			if !ok {
				// Hub closed the channel
				c.Conn.WriteMessage(1, nil)
				return
			}

			// Filter by subscription if needed
			c.Mu.RLock()
			subID := c.SubElID
			c.Mu.RUnlock()

			if subID > 0 {
				if data, ok := msg.Data.(ResultUpdate); ok {
					if data.ElectionID != subID {
						continue // Skip if not subscribed to this election
					}
				}
			}

			data, err := json.Marshal(msg)
			if err != nil {
				return
			}

			if err := c.Conn.WriteMessage(1, data); err != nil {
				return
			}

		case <-c.quit:
			return
		}
	}
}
