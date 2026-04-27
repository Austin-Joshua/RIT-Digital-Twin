.PHONY: dev stop build test clean setup docker logs

setup:
	@cp -n .env.example .env || true
	@cd frontend && npm install
	@echo "Setup complete. Edit .env with your values, then run: make dev"

dev:
	@bash scripts/dev.sh

stop:
	@docker-compose down
	@pkill -f "spring-boot:run" || true
	@pkill -f "vite" || true

build:
	@cd frontend && npm run build
	@cd backend && ./mvnw clean package -DskipTests

test:
	@cd frontend && npm run test:run
	@cd backend && ./mvnw test

clean:
	@cd frontend && rm -rf dist node_modules
	@cd backend && ./mvnw clean
	@docker-compose down -v

docker:
	@docker-compose up --build -d

logs:
	@docker-compose logs -f
