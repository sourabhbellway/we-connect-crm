# WeConnect CRM

## Quick Start

### Server Setup (First Time)

1. **Environment Files:**
   ```bash
   # Backend
   cp api/env.template api/.env
   # Update api/.env with your database credentials
   
   # Frontend
   cp client/env.template client/.env
   ```

2. **Database Setup:**
   ```bash
   cd api
   npm install
   npm run prisma:generate
   npm run prisma:migrate
   npm run seed  # Create admin user
   ```

3. **Build & Start:**
   ```bash
   # Backend
   cd api
   npm run build
   pm2 start ecosystem.config.js
   
   # Frontend
   cd ../client
   npm install
   npm run build
   ```

### Daily Deployment

```bash
# Pull, build, and restart
./deploy-vps.sh
```

**Default Login:**
- Email: `admin@weconnect.com`
- Password: `admin123`

### Configuration

- **API Port:** 3010
- **Frontend URL:** http://147.93.27.62:4176
- **API URL:** http://147.93.27.62:3010/api

### Environment Files

- `api/.env` - Backend configuration (database, JWT, etc.)
- `client/.env` - Frontend configuration (API URL)

