#!/bin/bash

# Simplified Render Build Script - No TypeScript Checking
echo "🚀 Starting Render build (TypeScript check disabled)..."

# Memory optimization for Render
export NODE_OPTIONS="--max_old_space_size=1024"

# Install without running postinstall scripts (skips TypeScript check)
echo "📦 Installing dependencies..."
npm ci --ignore-scripts --only=production=false

# Build frontend with Vite
echo "🔧 Building frontend..."
npx vite build --logLevel=error

# Build server with external dependencies
echo "🔧 Building server..."
npx esbuild server/index.ts \
  --platform=node \
  --packages=external \
  --bundle \
  --format=esm \
  --outdir=dist \
  --external:vite \
  --external:mongodb \
  --external:mongoose \
  --external:mongodb-memory-server \
  --log-level=error

echo "✅ Build completed successfully!"
ls -la dist/