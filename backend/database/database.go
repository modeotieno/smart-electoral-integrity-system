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

	host := os.Getenv("DB_HOST")
	if host == "" {
		host = "localhost"
	}
	port := os.Getenv("DB_PORT")
	if port == "" {
		port = "5432"
	}
	user := os.Getenv("DB_USER")
	if user == "" {
		user = "seis_user"
	}
	password := os.Getenv("DB_PASSWORD")
	if password == "" {
		password = "seis_password"
	}
	name := os.Getenv("DB_NAME")
	if name == "" {
		name = "seis_db"
	}

	return "postgres://" + user + ":" + password + "@" + host + ":" + port + "/" + name + "?sslmode=disable"
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
	backoff := []time.Duration{1, 2, 3, 5, 5, 5, 5}
	var pool *pgxpool.Pool
	var err error
	for _, sec := range backoff {
		pool, err = Connect()
		if err == nil {
			return pool, nil
		}
		time.Sleep(sec * time.Second)
	}
	return nil, err
}
