// INTEGRATION GUIDE: How to use WebSocket in your election monitoring

// ============================================================================
// EXAMPLE 1: Basic WebSocket Connection in React Component
// ============================================================================

import React, { useEffect, useState } from 'react';
import LiveUpdateManager from '../../api/liveUpdates';

export default function ElectionMonitor() {
  const [results, setResults] = useState([]);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    // Initialize WebSocket connection
    const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/ws/live`;
    const manager = new LiveUpdateManager(wsUrl);

    // Handle connection events
    manager.on('connected', () => {
      setIsLive(true);
      manager.subscribe(1); // Subscribe to election ID 1
    });

    manager.on('disconnected', () => {
      setIsLive(false);
    });

    // Handle real-time result updates
    manager.on('result_update', (resultData) => {
      console.log('New result received:', resultData);
      setResults(prev => [...prev, resultData]);
    });

    // Connect and cleanup on unmount
    manager.connect().catch(err => console.error('WebSocket error:', err));

    return () => manager.disconnect();
  }, []);

  return (
    <div>
      <div>{isLive ? '🟢 Live' : '🔴 Offline'}</div>
      <ul>
        {results.map((r, i) => (
          <li key={i}>
            Result {r.result_id}: {r.votes} votes
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============================================================================
// EXAMPLE 2: Broadcasting Result Updates (Backend - Go)
// ============================================================================

// In your SubmitResult handler, after saving to database:

func (h *ResultsHandler) SubmitResult(c *gin.Context, wsHub *websocket.Hub) {
  // ... existing code to save result ...

  // After successful insert, notify all connected clients
  resultUpdate := websocket.ResultUpdate{
    ResultID:         id,
    ElectionID:       req.ElectionID,
    CandidateID:      req.CandidateID,
    PollingStationID: req.PollingStationID,
    Votes:            req.Votes,
    Verified:         false,
  }
  
  wsHub.BroadcastResultUpdate(resultUpdate)
  
  c.JSON(http.StatusCreated, gin.H{"message": "result submitted", "id": id})
}

// ============================================================================
// EXAMPLE 3: Monitoring Performance Metrics
// ============================================================================

import { useEffect, useState } from 'react';

export function useMetrics() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      const token = localStorage.getItem('seis_token');
      const res = await fetch('/api/metrics', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMetrics(data.metrics);
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return metrics;
}

// Usage in component:
function Dashboard() {
  const metrics = useMetrics();

  if (!metrics) return <div>Loading metrics...</div>;

  return (
    <div>
      <p>Active Connections: {metrics.active_websockets}</p>
      <p>Avg Response Time: {metrics.avg_response_time_ms.toFixed(2)}ms</p>
      <p>Error Rate: {metrics.error_rate_percent.toFixed(2)}%</p>
    </div>
  );
}

// ============================================================================
// EXAMPLE 4: Custom Event Handling with Filtering
// ============================================================================

class ElectionStream {
  constructor(electionID) {
    this.electionID = electionID;
    this.manager = new LiveUpdateManager(this.getWsUrl());
    this.callbacks = {};
  }

  getWsUrl() {
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${proto}//${window.location.host}/api/ws/live`;
  }

  on(eventName, callback) {
    if (!this.callbacks[eventName]) {
      this.callbacks[eventName] = [];
    }
    this.callbacks[eventName].push(callback);
  }

  async connect() {
    // Set up internal handlers
    this.manager.on('result_update', (data) => {
      // Only process results for this election
      if (data.election_id === this.electionID) {
        this.emit('result', data);
      }
    });

    this.manager.on('tally_update', (data) => {
      if (data.election_id === this.electionID) {
        this.emit('tally', data);
      }
    });

    this.manager.on('connected', () => {
      this.emit('connected');
      this.manager.subscribe(this.electionID);
    });

    this.manager.on('disconnected', () => {
      this.emit('disconnected');
    });

    await this.manager.connect();
  }

  emit(eventName, data) {
    if (this.callbacks[eventName]) {
      this.callbacks[eventName].forEach(cb => cb(data));
    }
  }

  disconnect() {
    this.manager.disconnect();
  }
}

// Usage:
const stream = new ElectionStream(1);
stream.on('result', (result) => {
  console.log('Result for election 1:', result);
});
stream.connect();

// ============================================================================
// EXAMPLE 5: Multi-Election Monitoring (Switch Between Elections)
// ============================================================================

export function useElectionStreams(electionIds) {
  const [data, setData] = useState({});
  const [connections, setConnections] = useState({});

  useEffect(() => {
    const streams = {};

    // Create stream for each election
    electionIds.forEach(electionId => {
      const stream = new ElectionStream(electionId);

      stream.on('result', (result) => {
        setData(prev => ({
          ...prev,
          [electionId]: [...(prev[electionId] || []), result]
        }));
      });

      stream.on('connected', () => {
        setConnections(prev => ({
          ...prev,
          [electionId]: 'connected'
        }));
      });

      streams[electionId] = stream;
      stream.connect();
    });

    return () => {
      Object.values(streams).forEach(stream => stream.disconnect());
    };
  }, [electionIds]);

  return { data, connections };
}

// Usage in component:
function MultiElectionDashboard() {
  const { data, connections } = useElectionStreams([1, 2, 3]);

  return (
    <div>
      {Object.entries(connections).map(([electionId, status]) => (
        <div key={electionId}>
          <h3>Election {electionId}: {status === 'connected' ? '🟢' : '🔴'}</h3>
          <p>Results: {data[electionId]?.length || 0}</p>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// EXAMPLE 6: Error Handling and Reconnection
// ============================================================================

class RobustElectionStream {
  constructor(electionID) {
    this.electionID = electionID;
    this.manager = null;
    this.reconnectAttempts = 0;
    this.maxAttempts = 5;
  }

  async connect() {
    try {
      this.manager = new LiveUpdateManager(this.getWsUrl());

      // Error handling
      this.manager.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.handleError(error);
      });

      this.manager.on('reconnect_failed', () => {
        console.error('Failed to reconnect after', this.maxAttempts, 'attempts');
        // Fallback to HTTP polling
        this.startHttpPolling();
      });

      await this.manager.connect();
      this.reconnectAttempts = 0;
    } catch (err) {
      console.error('Connection failed:', err);
      if (this.reconnectAttempts < this.maxAttempts) {
        this.reconnectAttempts++;
        const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff
        setTimeout(() => this.connect(), delay);
      } else {
        this.startHttpPolling();
      }
    }
  }

  handleError(error) {
    // Log error, notify user, etc.
    console.error('Stream error:', error);
  }

  startHttpPolling() {
    console.warn('Falling back to HTTP polling (5 second intervals)');
    this.pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/results?election=${this.electionID}`);
        const data = await res.json();
        // Update UI with data
      } catch (err) {
        console.error('Poll error:', err);
      }
    }, 5000);
  }

  disconnect() {
    if (this.manager) {
      this.manager.disconnect();
    }
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
  }

  getWsUrl() {
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${proto}//${window.location.host}/api/ws/live`;
  }
}

// ============================================================================
// EXAMPLE 7: Caching Results to LocalStorage
// ============================================================================

class CachedElectionStream {
  constructor(electionID) {
    this.electionID = electionID;
    this.cacheKey = `election_${electionID}_results`;
    this.stream = new ElectionStream(electionID);
  }

  async connect() {
    // Load cached results
    const cached = localStorage.getItem(this.cacheKey);
    if (cached) {
      this.results = JSON.parse(cached);
    } else {
      this.results = [];
    }

    // Listen for new results
    this.stream.on('result', (result) => {
      this.results.push(result);
      // Save to localStorage
      localStorage.setItem(this.cacheKey, JSON.stringify(this.results));
      this.onResultUpdate(result);
    });

    await this.stream.connect();
  }

  onResultUpdate(result) {
    // Override in subclass
  }

  getResults() {
    return this.results;
  }

  clearCache() {
    localStorage.removeItem(this.cacheKey);
    this.results = [];
  }

  disconnect() {
    this.stream.disconnect();
  }
}

// ============================================================================
// EXAMPLE 8: Performance Monitoring Helper
// ============================================================================

class PerformanceMonitor {
  constructor() {
    this.stats = {
      messagesReceived: 0,
      messagesSent: 0,
      errors: 0,
      avgLatency: 0,
      latencies: []
    };
  }

  recordMessage(latency) {
    this.stats.messagesReceived++;
    this.stats.latencies.push(latency);
    
    // Keep only last 100 messages
    if (this.stats.latencies.length > 100) {
      this.stats.latencies.shift();
    }
    
    // Calculate average
    this.stats.avgLatency = this.stats.latencies.reduce((a, b) => a + b, 0) / this.stats.latencies.length;
  }

  recordError() {
    this.stats.errors++;
  }

  getStats() {
    return {
      ...this.stats,
      errorRate: (this.stats.errors / this.stats.messagesReceived * 100).toFixed(2) + '%'
    };
  }

  logStats() {
    console.table(this.getStats());
  }
}

// Usage:
const monitor = new PerformanceMonitor();
const stream = new ElectionStream(1);
stream.on('result', (result) => {
  monitor.recordMessage(10); // 10ms latency
});
stream.connect();

// Log stats every 30 seconds
setInterval(() => monitor.logStats(), 30000);
