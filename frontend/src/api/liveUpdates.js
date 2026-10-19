// WebSocket management for live election updates
class LiveUpdateManager {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.listeners = {}; // event -> [callbacks]
    this.connectedAt = null;
    this.subscriptions = new Set(); // Set of election IDs subscribed
    this.closed = false;
    this.reconnectTimer = null;
  }

  /**
   * Connect to WebSocket server
   */
  connect() {
    if (
      this.ws &&
      (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)
    ) {
      return Promise.resolve();
    }

    this.closed = false;

    return new Promise((resolve, reject) => {
      let ws;
      try {
        ws = new WebSocket(this.wsUrl);
        this.ws = ws;

        ws.onopen = () => {
          if (this.ws !== ws) return;
          console.log("[WS] Connected to live update server");
          this.connectedAt = new Date();
          this.reconnectAttempts = 0;
          this.emit("connected", { timestamp: this.connectedAt });
          resolve();
        };

        ws.onmessage = (event) => {
          if (this.ws !== ws) return;
          try {
            const msg = JSON.parse(event.data);
            this.handleMessage(msg);
          } catch (err) {
            console.error("[WS] Failed to parse message:", err);
          }
        };

        ws.onerror = (error) => {
          if (this.ws !== ws) return;
          console.error("[WS] Connection error:", error);
          this.emit("error", { error: error.message });
          reject(error);
        };

        ws.onclose = () => {
          if (this.ws !== ws) return;
          this.ws = null;
          console.log("[WS] Disconnected from live update server");
          this.emit("disconnected", { timestamp: new Date() });
          this.attemptReconnect();
        };
      } catch (err) {
        console.error("[WS] Failed to create WebSocket:", err);
        reject(err);
      }
    });
  }

  /**
   * Subscribe to updates for a specific election
   */
  subscribe(electionID) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const msg = {
        type: "subscribe",
        election_id: electionID,
      };
      this.ws.send(JSON.stringify(msg));
      this.subscriptions.add(electionID);
      console.log(`[WS] Subscribed to election ${electionID}`);
    }
  }

  /**
   * Unsubscribe from election updates
   */
  unsubscribe(electionID) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const msg = {
        type: "unsubscribe",
        election_id: electionID,
      };
      this.ws.send(JSON.stringify(msg));
      this.subscriptions.delete(electionID);
      console.log(`[WS] Unsubscribed from election ${electionID}`);
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  handleMessage(msg) {
    switch (msg.type) {
      case "result_update":
        this.emit("result_update", msg.data);
        break;
      case "candidate_tally":
        this.emit("tally_update", msg.data);
        break;
      case "system_status":
        this.emit("status", msg.data);
        break;
      default:
        console.warn("[WS] Unknown message type:", msg.type);
    }
  }

  /**
   * Register listener for WebSocket events
   */
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  /**
   * Remove listener
   */
  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback);
    }
  }

  /**
   * Emit event to all listeners
   */
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((callback) => callback(data));
    }
  }

  /**
   * Attempt to reconnect
   */
  attemptReconnect() {
    if (this.closed) return;
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `[WS] Reconnecting (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${this.reconnectDelay}ms`
      );
      this.reconnectTimer = setTimeout(() => {
        this.reconnectTimer = null;
        if (this.closed) return;
        this.connect().catch(() => {
          // Will recursively attempt again
        });
      }, this.reconnectDelay);
    } else {
      console.error(
        "[WS] Max reconnection attempts reached. Please refresh the page."
      );
      this.emit("reconnect_failed", {
        attempts: this.reconnectAttempts,
      });
    }
  }

  /**
   * Check if connected
   */
  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Disconnect gracefully
   */
  disconnect() {
    this.closed = true;
    this.reconnectAttempts = 0;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    const ws = this.ws;
    this.ws = null;
    if (ws && ws.readyState !== WebSocket.CLOSED) {
      ws.close();
    }
  }

  /**
   * Get uptime
   */
  getUptime() {
    if (!this.connectedAt) return null;
    return new Date() - this.connectedAt;
  }
}

export default LiveUpdateManager;
