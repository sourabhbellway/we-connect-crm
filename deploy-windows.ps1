# WeConnect CRM - Windows PowerShell Deployment Script
# This script helps prepare your code for production deployment

Write-Host "🚀 WeConnect CRM - Production Build Script" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (!(Test-Path "api\prisma\schema.prisma")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

# Check if .env files exist
Write-Host "📋 Checking environment files..." -ForegroundColor Yellow

if (!(Test-Path "api\.env")) {
    Write-Host "⚠️  api\.env not found!" -ForegroundColor Yellow
    Write-Host "Please create api\.env with production database credentials" -ForegroundColor Yellow
    exit 1
}

if (!(Test-Path "client\.env.production")) {
    Write-Host "⚠️  client\.env.production not found!" -ForegroundColor Yellow
    Write-Host "Please create client\.env.production with API URL" -ForegroundColor Yellow
    exit 1
}

# Backend build
Write-Host ""
Write-Host "🏗️  Building Backend..." -ForegroundColor Yellow
Set-Location api
npm install --production
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend dependencies installation failed" -ForegroundColor Red
    exit 1
}

# Generate Prisma Client
Write-Host "🔧 Generating Prisma Client..." -ForegroundColor Yellow
npm run prisma:generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Prisma client generation failed" -ForegroundColor Red
    exit 1
}

# Build backend
Write-Host "🏗️  Building backend..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend build failed" -ForegroundColor Red
    exit 1
}

# Frontend build
Write-Host ""
Write-Host "🏗️  Building Frontend..." -ForegroundColor Yellow
Set-Location ..\client
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend dependencies installation failed" -ForegroundColor Red
    exit 1
}

npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed" -ForegroundColor Red
    exit 1
}

Set-Location ..

Write-Host ""
Write-Host "✅ Build completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📦 Files ready for deployment:" -ForegroundColor Cyan
Write-Host "  - Backend: api\dist\" -ForegroundColor White
Write-Host "  - Frontend: client\dist\" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Upload these files to your VPS at 147.93.27.62" -ForegroundColor White
Write-Host "  2. SSH into your VPS" -ForegroundColor White
Write-Host "  3. Run: cd /path/to/project && npm run prisma:migrate" -ForegroundColor White
Write-Host "  4. Run: pm2 start ecosystem.config.js" -ForegroundColor White
Write-Host "  5. Run: pm2 save" -ForegroundColor White
Write-Host ""
Write-Host "📋 Or use the automated deployment script on VPS:" -ForegroundColor Yellow
Write-Host "  ./deploy-vps.sh" -ForegroundColor White
Write-Host ""