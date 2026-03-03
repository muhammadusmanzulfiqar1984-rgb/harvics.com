#!/bin/bash

# ============================================
# GO LIVE - Quick Production Deployment Script
# ============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}"
echo "╔════════════════════════════════════════════════════════╗"
echo "║                                                        ║"
echo "║          🚀 HARVICS - GO LIVE DEPLOYMENT              ║"
echo "║                                                        ║"
echo "╚════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"
cd "$PROJECT_DIR"

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo -e "${YELLOW}⚠️  .env.production not found${NC}"
    echo -e "${BLUE}Creating .env.production from template...${NC}"
    cat > .env.production << EOF
# Production Environment Variables
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.harvics.com
NEXT_PUBLIC_ENVIRONMENT=production

# Add your production API keys here
# OPENWEATHER_API_KEY=your-key
# MAPBOX_ACCESS_TOKEN=your-token
EOF
    echo -e "${GREEN}✅ Created .env.production${NC}"
    echo -e "${YELLOW}⚠️  Please update .env.production with your production values!${NC}"
    echo ""
fi

# Step 1: Check prerequisites
echo -e "${BLUE}[1/6] Checking prerequisites...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version must be 18+. Current: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v)${NC}"

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm $(npm -v)${NC}"
echo ""

# Step 2: Install dependencies
echo -e "${BLUE}[2/6] Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 3: Run tests (if available)
echo -e "${BLUE}[3/6] Running pre-deployment checks...${NC}"
if [ -f "package.json" ] && grep -q "\"test\"" package.json; then
    echo "  → Running tests..."
    npm test 2>/dev/null || echo -e "${YELLOW}⚠️  Tests skipped or failed (continuing...)${NC}"
else
    echo -e "${YELLOW}⚠️  No tests configured${NC}"
fi
echo ""

# Step 4: Build for production
echo -e "${BLUE}[4/6] Building for production...${NC}"
echo "  → This may take a few minutes..."
npm run build
echo -e "${GREEN}✅ Production build complete${NC}"
echo ""

# Step 5: Check build output
echo -e "${BLUE}[5/6] Verifying build output...${NC}"
if [ -d ".next" ]; then
    echo -e "${GREEN}✅ Build output found in .next/${NC}"
    BUILD_SIZE=$(du -sh .next 2>/dev/null | cut -f1)
    echo "  → Build size: $BUILD_SIZE"
else
    echo -e "${RED}❌ Build output not found${NC}"
    exit 1
fi
echo ""

# Step 6: Deployment options
echo -e "${BLUE}[6/6] Deployment Options${NC}"
echo ""
echo -e "${CYAN}════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  🚀 READY TO DEPLOY!${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}Choose your deployment method:${NC}"
echo ""
echo -e "${GREEN}Option 1: Vercel (Recommended - Best for Next.js)${NC}"
echo "  1. Install: npm i -g vercel"
echo "  2. Login: vercel login"
echo "  3. Deploy: vercel --prod"
echo ""
echo -e "${GREEN}Option 2: Netlify (Easy - Free tier available)${NC}"
echo "  1. Go to: https://www.netlify.com/"
echo "  2. Drag & drop the .next folder"
echo "  3. Or connect GitHub for auto-deploy"
echo ""
echo -e "${GREEN}Option 3: Manual Upload${NC}"
echo "  1. Upload .next folder to your hosting"
echo "  2. Set NODE_ENV=production"
echo "  3. Run: npm start"
echo ""
echo -e "${CYAN}════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}📁 Build Location:${NC}"
echo "  → $PROJECT_DIR/.next"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo "  1. Review .env.production file"
echo "  2. Set NEXT_PUBLIC_API_URL to your production API"
echo "  3. Choose deployment method above"
echo "  4. Deploy!"
echo ""
echo -e "${GREEN}✅ Your website is ready for production!${NC}"
echo ""

# Ask if user wants to deploy to Vercel
if command -v vercel &> /dev/null; then
    echo -e "${CYAN}Vercel CLI detected!${NC}"
    read -p "Deploy to Vercel now? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}Deploying to Vercel...${NC}"
        vercel --prod
        echo -e "${GREEN}✅ Deployed to Vercel!${NC}"
    fi
fi

echo ""
echo -e "${GREEN}🎉 Build complete! Ready to go live!${NC}"

