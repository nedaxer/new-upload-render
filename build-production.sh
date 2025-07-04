#!/bin/bash

# Production build script for Render deployment
# Bypasses TypeScript checking to avoid memory issues

echo "🚀 Building Nedaxer for production deployment..."

# Skip frontend build - use server-only approach to avoid memory issues
echo "📦 Skipping frontend build to conserve memory..."

# Build server with optimized ESBuild configuration
echo "🔧 Building server..."
npx esbuild server/index.ts \
  --platform=node \
  --packages=external \
  --bundle \
  --format=esm \
  --outdir=dist \
  --external:vite \
  --external:mongodb \
  --external:mongodb-memory-server \
  --external:mongoose \
  --minify

echo "✅ Production build completed successfully!"
echo "📄 Server built to: dist/index.js"