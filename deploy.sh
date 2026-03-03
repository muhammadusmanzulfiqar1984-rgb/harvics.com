#!/bin/bash

# Harvics Phase 1 Deployment Script
echo "🚀 Deploying Harvics Phase 1..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Run this from harviclocales-main directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
if npm run build; then
    echo "✅ Build successful!"
    echo ""
    echo "To start the production server:"
    echo "  npm start"
    echo ""
    echo "Or use PM2:"
    echo "  pm2 start npm --name harvics-frontend -- start"
else
    echo "❌ Build failed. Using development mode instead..."
    echo ""
    echo "To start in development mode:"
    echo "  npm run dev"
fi

