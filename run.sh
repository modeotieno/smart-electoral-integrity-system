#!/bin/bash
set -e
echo "== SEIS — one-command startup =="
echo "Building + starting postgres + backend + frontend as one stack..."
docker compose up --build -d
echo "Waiting for backend health..."
for i in {1..30}; do
  if curl -sf http://localhost:8080/api/health >/dev/null; then
    echo "Backend healthy!"
    break
  fi
  echo "  waiting $i..."
  sleep 2
done
echo ""
echo "Frontend: http://localhost:5173"
echo "Backend : http://localhost:8080/api/health"
echo "Get Started -> http://localhost:5173/register (Create Account with biometric)"
echo ""
docker compose ps
