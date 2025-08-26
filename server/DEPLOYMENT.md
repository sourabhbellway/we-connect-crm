# Backend Deployment Guide

## 🚀 Quick Deploy Options

### 1. Railway (Recommended - Free)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Deploy
railway init
railway up
```

### 2. Render (Free Tier)

1. Go to [render.com](https://render.com)
2. Connect your GitHub repository
3. Create new Web Service
4. Set build command: `npm install && npm run build`
5. Set start command: `npm start`
6. Add environment variables

### 3. Heroku (Paid)

```bash
# Install Heroku CLI
npm install -g heroku

# Login and deploy
heroku login
heroku create your-app-name
git push heroku main
```

## 🔧 Environment Variables for Production

Set these in your deployment platform:

```env
# Database (Use PostgreSQL for production)
DB_HOST=your-production-db-host
DB_PORT=5432
DB_NAME=your-production-db-name
DB_USER=your-production-db-user
DB_PASSWORD=your-production-db-password

# Server
PORT=8080
NODE_ENV=production

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=https://your-frontend-domain.com

# API
API_BASE_URL=http://31.97.233.21:8081/api
```

## 📝 Steps to Deploy

1. **Build the project**: `npm run build`
2. **Choose a platform** (Railway/Render/Heroku)
3. **Connect your repository**
4. **Set environment variables**
5. **Deploy**
6. **Update frontend API base URL** to your new backend URL

## 🔗 After Deployment

### Option 1: Environment Variables (Recommended)

Create a `.env` file in your frontend root:

```env
VITE_API_BASE_URL=http://31.97.233.21:8081/api
```

Update your frontend `authService.ts`:

```typescript
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://31.97.233.21:8081/api";
```

### Option 2: Hardcoded URL

```typescript
const API_BASE_URL = "http://31.97.233.21:8081/api";
```
