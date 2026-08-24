package database

import (
	"context"
	"os"

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
