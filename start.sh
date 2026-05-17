#!/bin/bash
# Quick Start Script for Multi-Agent Task Executor

echo "==================================="
echo "Multi-Agent Task Executor - Quick Start"
echo "==================================="

# Check prerequisites
echo "✓ Checking prerequisites..."

# Check Python
python --version > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ Python 3.9+ not found. Please install Python."
    exit 1
fi

# Check Node.js
node --version > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ Node.js 18+ not found. Please install Node.js."
    exit 1
fi

# Check MongoDB
echo "⚠️  Make sure MongoDB is running (mongod or MongoDB Atlas connection)"

echo ""
echo "=== Starting Backend (FastAPI) ==="
cd "$(dirname "$0")"
source venv/bin/activate 2>/dev/null || . venv/Scripts/activate
python api.py &
BACKEND_PID=$!

sleep 3

echo ""
echo "=== Starting Frontend (React + Vite) ==="
cd frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "=================================="
echo "✅ Both services are starting!"
echo "=================================="
echo ""
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both services"
echo ""

# Wait for both processes
wait

# Cleanup
kill $BACKEND_PID 2>/dev/null
kill $FRONTEND_PID 2>/dev/null

echo ""
echo "Services stopped."
