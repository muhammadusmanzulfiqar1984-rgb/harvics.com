#!/bin/bash

# ============================================
# PRODUCTION DEPLOYMENT TO WWW.HARVICS.COM
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
echo "║     🚀 DEPLOY TO WWW.HARVICS.COM - PRODUCTION          ║"
echo "║                                                        ║"
echo "╚════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"
cd "$PROJECT_DIR"

# Step 1: Check prerequisites
echo -e "${BLUE}[1/7] Checking prerequisites...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js 18+ required. Current: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v)${NC}"
echo ""

# Step 2: Create/Update .env.production
echo -e "${BLUE}[2/7] Setting up production environment...${NC}"

if [ ! -f ".env.production" ]; then
    echo -e "${YELLOW}⚠️  Creating .env.production...${NC}"
    cat > .env.production << 'EOF'
# Production Environment Variables
NODE_ENV=production

# Production API URL (REQUIRED - Update with your backend URL)
NEXT_PUBLIC_API_URL=https://api.harvics.com

# Production Site URL
NEXT_PUBLIC_SITE_URL=https://www.harvics.com

# Optional: Add your API keys here
# OPENWEATHER_API_KEY=your-key
# MAPBOX_ACCESS_TOKEN=your-token
EOF
    echo -e "${GREEN}✅ Created .env.production${NC}"
    echo -e "${YELLOW}⚠️  IMPORTANT: Update NEXT_PUBLIC_API_URL with your production backend URL!${NC}"
else
    echo -e "${GREEN}✅ .env.production exists${NC}"
    echo -e "${YELLOW}⚠️  Verify NEXT_PUBLIC_API_URL is set correctly${NC}"
fi
echo ""

# Step 3: Install dependencies
echo -e "${BLUE}[3/7] Installing dependencies...${NC}"
npm install --production=false
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 4: Run pre-deployment checks
echo -e "${BLUE}[4/7] Running pre-deployment checks...${NC}"
if [ -f "../scripts/pre-deploy.sh" ]; then
    bash ../scripts/pre-deploy.sh || echo -e "${YELLOW}⚠️  Pre-deploy checks had warnings (continuing...)${NC}"
else
    echo -e "${YELLOW}⚠️  Pre-deploy script not found (skipping...)${NC}"
fi
echo ""

# Step 5: Build for production
echo -e "${BLUE}[5/7] Building for production...${NC}"
echo -e "${YELLOW}  → This may take 2-5 minutes...${NC}"
NODE_ENV=production npm run build
echo -e "${GREEN}✅ Production build complete${NC}"
echo ""

# Step 6: Verify build
echo -e "${BLUE}[6/7] Verifying build...${NC}"
if [ -d ".next" ]; then
    BUILD_SIZE=$(du -sh .next 2>/dev/null | cut -f1)
    echo -e "${GREEN}✅ Build output found: $BUILD_SIZE${NC}"
else
    echo -e "${RED}❌ Build output not found${NC}"
    exit 1
fi
echo ""

# Step 7: Deployment options
echo -e "${BLUE}[7/7] Deployment Options${NC}"
echo ""
echo -e "${CYAN}════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  ✅ BUILD COMPLETE - READY TO DEPLOY${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${GREEN}📦 Build Location:${NC}"
echo "   → $PROJECT_DIR/.next"
echo ""

echo -e "${YELLOW}🚀 Choose Deployment Method:${NC}"
echo ""
echo -e "${GREEN}Option 1: Vercel (Recommended - Best for Next.js)${NC}"
echo "  1. npm i -g vercel"
echo "  2. vercel login"
echo "  3. vercel --prod"
echo "  4. Set domain: www.harvics.com"
echo "  5. Add env vars in Vercel dashboard"
echo ""

echo -e "${GREEN}Option 2: Netlify (Easy - Free tier)${NC}"
echo "  1. Go to: https://app.netlify.com"
echo "  2. Drag & drop .next folder"
echo "  3. OR connect GitHub for auto-deploy"
echo "  4. Set domain: www.harvics.com"
echo "  5. Add env vars in Netlify dashboard"
echo ""

echo -e "${GREEN}Option 3: Manual Upload${NC}"
echo "  1. Upload .next folder to your hosting"
echo "  2. Run: npm start"
echo "  3. Configure reverse proxy (nginx/Apache)"
echo ""

echo -e "${CYAN}════════════════════════════════════════════════════════${NC}"
echo ""

# Check if Vercel CLI is available
if command -v vercel &> /dev/null; then
    echo -e "${CYAN}Vercel CLI detected!${NC}"
    read -p "Deploy to Vercel now? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}Deploying to Vercel...${NC}"
        vercel --prod
        echo -e "${GREEN}✅ Deployed to Vercel!${NC}"
        echo ""
        echo -e "${YELLOW}📝 Next Steps:${NC}"
        echo "  1. Go to Vercel dashboard"
        echo "  2. Add domain: www.harvics.com"
        echo "  3. Add environment variables"
        echo "  4. Verify deployment"
    fi
fi

echo ""
echo -e "${GREEN}🎉 Build complete! Ready to deploy to www.harvics.com${NC}"
echo ""
echo -e "${YELLOW}⚠️  REMEMBER:${NC}"
echo "  1. Set NEXT_PUBLIC_API_URL to your production backend"
echo "  2. Configure backend CORS to allow www.harvics.com"
echo "  3. Set JWT_SECRET on backend (min 32 chars)"
echo "  4. Test login after deployment"
echo ""

