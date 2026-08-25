.PHONY: up down logs dev backend frontend test test-backend test-frontend test-integration

up:
	docker compose up --build -d
	@echo "SEIS running: frontend http://localhost:5173 backend http://localhost:8080 postgres :5432"

down:
	docker compose down

logs:
	docker compose logs -f

# local dev without docker (needs postgres running)
backend:
	cd backend && go run .

frontend:
	cd frontend && npm run dev

dev: 
	@echo "Run 'make backend' and 'make frontend' in two terminals"

test-backend:
	cd backend && go test ./... -v -count=1

test-frontend:
	cd frontend && npm run test

test-integration:
	@echo "Running live API integration (requires make up)..."
	cd backend && go test -run TestLiveAPI -v -count=1 -tags=integration || echo "integration tests skipped (no DB)"

test: test-backend test-frontend
	@echo "All tests passed"

# Production helpers
prod-check:
	@{ if [ ! -f .env ]; then echo "# dummy for prod-check" > .env; CREATED=1; fi; \
	CORS_ORIGINS=http://localhost:5173 JWT_SECRET=dummy-32chars-long-enough-test VITE_API_URL=http://localhost:8080 POSTGRES_PASSWORD=dummy-pass docker compose -f docker-compose.yml -f docker-compose.prod.yml config >/dev/null && echo "prod compose OK"; \
	if [ "$$CREATED" = "1" ]; then rm -f .env; echo "(temporary .env removed)"; fi; }

prod-up:
	@if [ ! -f .env ]; then echo "Missing .env — copy .env.example to .env and set strong secrets"; exit 1; fi
	docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
	@echo "SEIS prod up: frontend 127.0.0.1:5173 backend 127.0.0.1:8080 (behind reverse proxy)"

prod-down:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml down

# Generate a strong JWT secret
gen-secret:
	@openssl rand -base64 32 | tr -d '\n' | tee /tmp/seis_jwt_notice.txt; echo ""; echo "Set as JWT_SECRET in .env"

lint:
	cd backend && go vet ./...
	cd frontend && npm run build >/dev/null && echo "lint/build ok"
