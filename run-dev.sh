#!/bin/bash

echo "🚀 Starting CraftAI Website Development Server..."
echo ""

# Check if Go is installed
if ! command -v go &> /dev/null; then
    echo "❌ Go is not installed. Please install Go first:"
    echo "   brew install go"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
go mod init craftai-website 2>/dev/null || true
go get github.com/gorilla/mux
go get github.com/fsnotify/fsnotify

# Run the development server
echo ""
echo "🎯 Starting server..."
go run dev-server.go