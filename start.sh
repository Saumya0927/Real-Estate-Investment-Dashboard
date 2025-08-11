#!/bin/bash

echo "🚀 Starting Personal Real Estate Dashboard..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Check if backend node_modules exists
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from example..."
    cp .env.example .env
fi

echo ""
echo "✅ Setup complete! Starting services..."
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:3001"
echo "⚡ Lambda Functions: http://localhost:3003"
echo ""
echo "Starting services in background..."

# Start backend
cd backend && npm run dev &
BACKEND_PID=$!

# Start lambda
cd ../lambda && python local_server.py &
LAMBDA_PID=$!

# Start frontend (in foreground)
cd .. && npm run dev

# Cleanup on exit
trap 'echo "Stopping services..."; kill $BACKEND_PID $LAMBDA_PID 2>/dev/null; exit' INT TERM