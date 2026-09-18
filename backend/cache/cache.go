package cache

import (
	"sync"
	"time"
)

// CandidateTally represents cached vote counts per candidate
type CandidateTally struct {
	CandidateID   int
	CandidateName string
	TotalVotes    int
	ElectionID    int
	LastUpdated   time.Time
}

// ResultCache provides in-memory caching for election results
type ResultCache struct {
	mu               sync.RWMutex
	tallyByElection  map[int]map[int]*CandidateTally // election_id -> candidate_id -> tally
	tallyUpdateTime  map[int]time.Time                // election_id -> last update time
	cacheDuration    time.Duration
	lastRefreshTime  time.Time
}

// NewResultCache creates a new result cache
func NewResultCache(duration time.Duration) *ResultCache {
	return &ResultCache{
		tallyByElection: make(map[int]map[int]*CandidateTally),
		tallyUpdateTime: make(map[int]time.Time),
		cacheDuration:   duration,
		lastRefreshTime: time.Now(),
	}
}

// SetTally updates or creates a tally entry
func (rc *ResultCache) SetTally(electionID int, tally *CandidateTally) {
	rc.mu.Lock()
	defer rc.mu.Unlock()

	if rc.tallyByElection[electionID] == nil {
		rc.tallyByElection[electionID] = make(map[int]*CandidateTally)
	}
	tally.LastUpdated = time.Now()
	rc.tallyByElection[electionID][tally.CandidateID] = tally
	rc.tallyUpdateTime[electionID] = time.Now()
}

// GetTally retrieves a specific candidate's tally for an election
func (rc *ResultCache) GetTally(electionID, candidateID int) (*CandidateTally, bool) {
	rc.mu.RLock()
	defer rc.mu.RUnlock()

	if election, ok := rc.tallyByElection[electionID]; ok {
		if tally, ok := election[candidateID]; ok {
			return tally, true
		}
	}
	return nil, false
}

// GetElectionTallies returns all tallies for an election
func (rc *ResultCache) GetElectionTallies(electionID int) []*CandidateTally {
	rc.mu.RLock()
	defer rc.mu.RUnlock()

	var tallies []*CandidateTally
	if election, ok := rc.tallyByElection[electionID]; ok {
		for _, tally := range election {
			tallies = append(tallies, tally)
		}
	}
	return tallies
}

// SetBatch sets multiple tallies at once
func (rc *ResultCache) SetBatch(electionID int, tallies []*CandidateTally) {
	rc.mu.Lock()
	defer rc.mu.Unlock()

	rc.tallyByElection[electionID] = make(map[int]*CandidateTally)
	now := time.Now()
	for _, tally := range tallies {
		tally.LastUpdated = now
		rc.tallyByElection[electionID][tally.CandidateID] = tally
	}
	rc.tallyUpdateTime[electionID] = now
	rc.lastRefreshTime = now
}

// IsStale checks if cache is older than cacheDuration
func (rc *ResultCache) IsStale(electionID int) bool {
	rc.mu.RLock()
	defer rc.mu.RUnlock()

	if lastUpdate, ok := rc.tallyUpdateTime[electionID]; ok {
		return time.Since(lastUpdate) > rc.cacheDuration
	}
	return true
}

// Clear removes all cached data for an election
func (rc *ResultCache) Clear(electionID int) {
	rc.mu.Lock()
	defer rc.mu.Unlock()

	delete(rc.tallyByElection, electionID)
	delete(rc.tallyUpdateTime, electionID)
}

// ClearAll removes all cached data
func (rc *ResultCache) ClearAll() {
	rc.mu.Lock()
	defer rc.mu.Unlock()

	rc.tallyByElection = make(map[int]map[int]*CandidateTally)
	rc.tallyUpdateTime = make(map[int]time.Time)
	rc.lastRefreshTime = time.Now()
}
