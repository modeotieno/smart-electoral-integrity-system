.PHONY: up down logs dev backend frontend

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
