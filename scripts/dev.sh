#!/bin/bash
set -e

echo "Starting RIT Digital Twin..."

if [ ! -f .env ]; then
  echo "ERROR: .env file not found. Copy .env.example to .env and fill in values."
  exit 1
fi

set -a
source .env
set +a

echo "Starting MySQL..."
docker-compose up -d db
sleep 5

echo "Starting backend..."
cd backend && ./mvnw spring-boot:run &
BACKEND_PID=$!

echo "Starting frontend..."
cd ../frontend && npm run dev &
FRONTEND_PID=$!

echo ""
echo "RIT Digital Twin running:"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:8080"
echo "  Swagger:  http://localhost:8080/swagger-ui/index.html"
echo ""
echo "Press Ctrl+C to stop all services"

trap "kill $BACKEND_PID $FRONTEND_PID; docker-compose down" EXIT
wait
