#!/bin/bash

# GRAMS Project Startup Script for Mac/Linux

echo ""
echo "╔════════════════════════════════════════╗"
echo "║  GRAMS - Grievance Redressal System    ║"
echo "║  Development Server Startup            ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Check if node_modules exists
if [ ! -d "server/node_modules" ]; then
    echo "⚠️  Dependencies not installed!"
    echo "Installing dependencies... This may take a few minutes."
    npm run install-all
    if [ $? -ne 0 ]; then
        echo "❌ Installation failed!"
        exit 1
    fi
fi

# Check if .env files exist
if [ ! -f "server/.env" ]; then
    echo "⚠️  server/.env not found!"
    echo "Creating from template..."
    cp "server/.env.example" "server/.env"
fi

if [ ! -f "client/.env" ]; then
    echo "⚠️  client/.env not found!"
    echo "Creating from template..."
    cp "client/.env.example" "client/.env"
fi

echo ""
echo "✅ All checks passed!"
echo ""
echo "🚀 Starting development servers..."
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:5000"
echo "   API:      http://localhost:5000/api"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

npm run dev
