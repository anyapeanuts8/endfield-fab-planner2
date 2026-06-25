#!/bin/bash
set -e

echo "=== Endfield Fab Planner ==="

# バックエンド起動
echo "[1/2] Starting backend (http://localhost:8000)..."
cd "$(dirname "$0")/backend"
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# フロントエンド起動
echo "[2/2] Starting frontend (http://localhost:5173)..."
cd "$(dirname "$0")/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "Backend:  http://localhost:8000"
echo "Frontend: http://localhost:5173"
echo "API docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop"

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
wait
