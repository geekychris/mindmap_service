#!/bin/bash

# Mind Controll - Stop Script
# Stops both backend and frontend servers

echo "🛑 Stopping Mind Controll services..."
echo ""

# Stop using saved PIDs
if [ -f .backend.pid ]; then
    BACKEND_PID=$(cat .backend.pid)
    echo "Stopping backend (PID: $BACKEND_PID)..."
    kill $BACKEND_PID 2>/dev/null && echo "✅ Backend stopped" || echo "⚠️  Backend not running"
    rm .backend.pid
fi

if [ -f .frontend.pid ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    echo "Stopping frontend (PID: $FRONTEND_PID)..."
    kill $FRONTEND_PID 2>/dev/null && echo "✅ Frontend stopped" || echo "⚠️  Frontend not running"
    rm .frontend.pid
fi

# Fallback: kill by port
echo ""
echo "Cleaning up any remaining processes..."
lsof -ti:8080 | xargs kill -9 2>/dev/null && echo "✅ Cleaned up port 8080" || true
lsof -ti:5173 | xargs kill -9 2>/dev/null && echo "✅ Cleaned up port 5173" || true

echo ""
echo "✨ All services stopped"
