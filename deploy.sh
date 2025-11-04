#!/bin/bash

# WeConnect CRM Deployment Script
# This script helps automate the deployment process

set -e  # Exit on error

echo "🚀 Starting WeConnect CRM Deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env files exist
echo -e "${YELLOW}Checking environment files...${NC}"

if [ ! -f "api/.env" ]; then
    echo -e "${RED}❌ api/.env file not found!${NC}"
    echo "Please create api/.env file with required environment variables"
    echo "See DEPLOYMENT.md for details"
    exit 1
fi

if [ ! -f "client/.env" ]; then
    echo -e "${YELLOW}⚠️  client/.env file not found (optional for production)${NC}"
fi

# Install dependencies
echo -e "${YELLOW}Installing backend dependencies...${NC}"
cd api
npm install

echo -e "${YELLOW}Installing frontend dependencies...${NC}"
cd ../client
npm install

# Generate Prisma Client
echo -e "${YELLOW}Generating Prisma Client...${NC}"
cd ../api
npm run prisma:generate

# Run migrations
echo -e "${YELLOW}Running database migrations...${NC}"
npm run prisma:migrate

# Build backend
echo -e "${YELLOW}Building backend...${NC}"
npm run build

# Build frontend
echo -e "${YELLOW}Building frontend...${NC}"
cd ../client
npm run build

# Create logs directory
echo -e "${YELLOW}Setting up logs directory...${NC}"
cd ../api
mkdir -p logs

# PM2 setup
echo -e "${YELLOW}Starting application with PM2...${NC}"
if pm2 list | grep -q "weconnect-api"; then
    echo -e "${YELLOW}Restarting existing PM2 process...${NC}"
    pm2 restart weconnect-api
else
    echo -e "${YELLOW}Starting new PM2 process...${NC}"
    pm2 start ecosystem.config.js
fi

# Save PM2 configuration
pm2 save

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo ""
echo "Next steps:"
echo "1. Check PM2 status: pm2 status"
echo "2. Check logs: pm2 logs weconnect-api"
echo "3. Test health endpoint: curl http://localhost:3001/api/health"
echo "4. Configure Nginx (see DEPLOYMENT.md)"
echo ""
echo -e "${GREEN}🎉 Your application is now running!${NC}"

