package database

import (
	"context"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

func dsnFromEnv() string {
	if v := os.Getenv("DATABASE_URL"); v != "" {
		return v
	}
	return "postgres://seis_user:seis_password@localhost:5432/seis_db?sslmode=disable"
}

// Connect returns a *pgxpool.Pool suitable for concurrent use.
// It reads DATABASE_URL env var with fallback to docker-compose defaults.
func Connect() (*pgxpool.Pool, error) {
	dsn := dsnFromEnv()
	cfg, err := pgxpool.ParseConfig(dsn)
	if err != nil {
		return nil, err
	}
	cfg.MaxConns = 10
	cfg.MinConns = 1

	pool, err := pgxpool.NewWithConfig(context.Background(), cfg)
	if err != nil {
		return nil, err
	}
	if err := pool.Ping(context.Background()); err != nil {
		pool.Close()
		return nil, err
	}
	return pool, nil
}

// ConnectWithRetry tries Connect with backoff for docker-compose startup ordering.
// Keeps one pool and retries ping for up to 30s.
func ConnectWithRetry() (*pgxpool.Pool, error) {
	backoff := []int{1, 2, 3, 5, 5, 5, 5}
	var pool *pgxpool.Pool
	var err error
	for _, sec := range backoff {
		pool, err = Connect()
		if err == nil {
			return pool, nil
		}
		// sleep using context background
		select {
		case <-context.Background().Done():
			return nil, err
		case <-timeAfter(sec):
		}
	}
	return nil, err
}

func timeAfter(sec int) <-chan struct{} {
	ch := make(chan struct{})
	go func() {
		// use time.Sleep without importing time at top? we import lazily
		// but we need time package - add import
		// This helper avoids circular import issues; actual sleep done via context timeout trick
		// We'll use a simple busy wait with context with timeout
		ctx, cancel := context.WithTimeout(context.Background(), time.Duration(sec)*time.Second)
		defer cancel()
		<-ctx.Done()
		close(ch)
	}()
	return ch
}
