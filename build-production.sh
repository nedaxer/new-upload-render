#!/bin/bash

# Production build script for Render deployment
# Memory-optimized approach avoiding problematic dependencies

echo "🚀 Building Nedaxer for production deployment..."

# Build server only - avoid Vite import issues completely
echo "🔧 Building server without problematic dependencies..."
npx esbuild server/index.production.ts \
  --platform=node \
  --bundle \
  --format=esm \
  --outfile=dist/index.js \
  --external:vite \
  --external:mongodb \
  --external:mongodb-memory-server \
  --external:mongoose \
  --external:@vitejs/plugin-react \
  --external:@replit/vite-plugin-cartographer \
  --external:@replit/vite-plugin-runtime-error-modal \
  --external:@replit/vite-plugin-shadcn-theme-json \
  --external:@mapbox/node-pre-gyp \
  --external:mock-aws-s3 \
  --external:aws-sdk \
  --external:nock \
  --external:canvas \
  --loader:.html=text \
  --minify

echo "✅ Production build completed successfully!"
echo "📄 Server built to: dist/index.js"
echo "⚡ Ready for Render deployment"