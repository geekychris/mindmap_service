#!/bin/bash

# Mind Controll - Start Script
# Starts both backend and frontend servers

set -e

echo "🚀 Starting Mind Controll..."
echo ""

# Check Java version
echo "Checking Java version..."
export JAVA_HOME=$(/usr/libexec/java_home -v 21)
java --version | head -n 1

# Check Node version
echo "Checking Node version..."
node --version

echo ""
echo "📦 Starting Backend (Spring Boot)..."
echo "   URL: http://localhost:8080/api/v1"
echo "   Swagger: http://localhost:8080/api/v1/swagger-ui.html"
echo ""

# Start backend in background
cd "$(dirname "$0")"
export JAVA_HOME=$(/usr/libexec/java_home -v 21)
mvn spring-boot:run -Dspring-boot.run.profiles=demo > backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait for backend to start
echo "Waiting for backend to start..."
for i in {1..30}; do
    if curl -s http://localhost:8080/api/v1/actuator/health > /dev/null 2>&1 || \
       curl -s http://localhost:8080/api/v1/swagger-ui.html > /dev/null 2>&1; then
        echo "✅ Backend is ready!"
        break
    fi
    echo -n "."
    sleep 2
done
echo ""

echo ""
echo "🎨 Starting Frontend (React)..."
echo "   URL: http://localhost:5173"
echo ""

# Start frontend in background
cd frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

echo ""
echo "✨ Mind Controll is starting up!"
echo ""
echo "📊 Services:"
echo "   Frontend:  http://localhost:5173"
echo "   Backend:   http://localhost:8080/api/v1"
echo "   Swagger:   http://localhost:8080/api/v1/swagger-ui.html"
echo "   H2 Console: http://localhost:8080/api/v1/h2-console"
echo ""
echo "📝 Logs:"
echo "   Backend:  tail -f backend.log"
echo "   Frontend: tail -f frontend.log"
echo ""
echo "🛑 To stop:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo "   or run: ./stop-all.sh"
echo ""
echo "💡 Demo data includes 3 users (alice, bob, charlie) and 3 mind maps"
echo ""

# Save PIDs for stop script
echo "$BACKEND_PID" > .backend.pid
echo "$FRONTEND_PID" > .frontend.pid

# Keep script running and show logs
echo "Press Ctrl+C to view logs (services will continue running in background)"
sleep 3
echo ""
echo "=== Backend Log (last 10 lines) ==="
tail -n 10 backend.log
echo ""
echo "=== Frontend Log (last 10 lines) ==="
tail -n 10 frontend.log || echo "(frontend still starting...)"
