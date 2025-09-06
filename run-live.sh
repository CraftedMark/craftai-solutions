#!/bin/bash

echo "🚀 Starting CraftAI Website with Live Reload..."
echo ""

# Check if Go is installed
if ! command -v go &> /dev/null; then
    echo "❌ Go is not installed. Please install Go first:"
    echo "   brew install go"
    exit 1
fi

# Kill any existing server on port 8080
echo "🔍 Checking for existing servers..."
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Found existing server on port 8080, stopping it..."
    kill $(lsof -t -i:8080) 2>/dev/null
    sleep 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
go get github.com/gorilla/mux 2>/dev/null
go get github.com/fsnotify/fsnotify 2>/dev/null
go get github.com/gorilla/websocket 2>/dev/null

# Run the live reload server
echo ""
echo "🎯 Starting live reload server..."
go run live-server.go