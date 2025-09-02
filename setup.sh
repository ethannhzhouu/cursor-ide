#!/bin/bash

# Development startup script

echo "🚀 Starting Cursor IDE Development Environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully!"
echo ""
echo "🎯 To start development:"
echo "1. Backend:  cd backend && npm run dev"
echo "2. Frontend: cd frontend && npm run dev"
echo ""
echo "🌐 Frontend will be available at: http://localhost:5173"
echo "🔧 Backend will be available at: http://localhost:3001"
