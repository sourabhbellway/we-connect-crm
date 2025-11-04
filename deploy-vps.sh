#!/bin/bash

# VPS Deployment Script
# यह script VPS पर code pull करने और deploy करने के लिए है

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Starting VPS Deployment...${NC}"
echo ""

# Check if .env files exist
if [ ! -f "api/.env" ]; then
    echo -e "${RED}❌ api/.env file not found!${NC}"
    echo "Please create api/.env file first"
    echo "See VPS_DEPLOYMENT_WORKFLOW.md for details"
    exit 1
fi

# Git pull
echo -e "${YELLOW}📥 Pulling latest code from Git...${NC}"
git pull origin main || {
    echo -e "${RED}❌ Git pull failed!${NC}"
    exit 1
}

# Backend dependencies
echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
cd api
npm install --production

# Frontend dependencies
echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
cd ../client
npm install

# Prisma generate
echo -e "${YELLOW}🔧 Generating Prisma client...${NC}"
cd ../api
npm run prisma:generate

# Run migrations
echo -e "${YELLOW}🗄️  Running database migrations...${NC}"
npm run prisma:migrate || {
    echo -e "${YELLOW}⚠️  Migration warning (continuing anyway)...${NC}"
}

# Build backend
echo -e "${YELLOW}🏗️  Building backend...${NC}"
npm run build

# Build frontend
echo -e "${YELLOW}🏗️  Building frontend...${NC}"
cd ../client
npm run build

# Restart PM2
echo -e "${YELLOW}🔄 Restarting application with PM2...${NC}"
cd ../api

# Check if PM2 process exists
if pm2 list | grep -q "weconnect-api"; then
    echo -e "${YELLOW}Restarting existing PM2 process...${NC}"
    pm2 restart weconnect-api
else
    echo -e "${YELLOW}Starting new PM2 process...${NC}"
    mkdir -p logs
    pm2 start ecosystem.config.js
    pm2 save
fi

# Wait a moment
sleep 2

# Health check
echo ""
echo -e "${YELLOW}🏥 Checking application health...${NC}"
HEALTH_CHECK=$(curl -s http://localhost:3001/api/health || echo "failed")

if echo "$HEALTH_CHECK" | grep -q "success"; then
    echo -e "${GREEN}✅ Application is healthy!${NC}"
else
    echo -e "${RED}⚠️  Health check failed or application not responding${NC}"
    echo "Check logs: pm2 logs weconnect-api"
fi

echo ""
echo -e "${GREEN}✅ Deployment completed!${NC}"
echo ""
echo -e "${BLUE}📊 Status:${NC}"
pm2 status
echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo "  1. Check logs: pm2 logs weconnect-api"
echo "  2. Check health: curl http://localhost:3001/api/health"
echo "  3. Test frontend in browser"
echo ""

