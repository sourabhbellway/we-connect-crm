# 🚀 WeConnect CRM - Production Deployment Guide

## ✅ Pre-Deployment Checklist

Your database is already synced! Now let's deploy to production.

---

## 📋 Step 1: Configure Production Environment

### Backend Configuration (VPS)

1. **SSH into your VPS:**
```bash
ssh your-user@147.93.27.62
```

2. **Navigate to project:**
```bash
cd /path/to/we-connect-crm-main
```

3. **Update Production Database URL:**
Edit `api/.env` file:
```bash
nano api/.env
```

Update the DATABASE_URL:
```env
DATABASE_URL=postgresql://postgres:YOUR_SECURE_PASSWORD@localhost:5432/we_connect_crm?schema=public
```

**IMPORTANT Security Updates:**
- Change `JWT_SECRET` to a strong random string
- Update PostgreSQL password
- Configure SMTP settings for email functionality
- Set `NODE_ENV=production`

### Frontend Configuration

Edit `client/.env.production`:
```bash
nano client/.env.production
```

Ensure it has:
```env
VITE_API_BASE_URL=http://147.93.27.62:3010/api
APP_ENV=production
```

---

## 🔧 Step 2: Production Database Setup

```bash
cd api

# Install dependencies
npm install --production

# Generate Prisma Client
npm run prisma:generate

# Apply migrations (already done locally, but confirm on server)
npm run prisma:migrate

# Seed initial data (creates admin user)
npm run seed
```

---

## 🏗️ Step 3: Build Applications

### Backend Build
```bash
cd api
npm run build
```

### Frontend Build
```bash
cd ../client
npm install
npm run build
```

---

## 🚀 Step 4: Deploy with PM2

### Start Backend API
```bash
cd api

# Create logs directory
mkdir -p logs

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
```

### Serve Frontend (Choose Option A or B)

**Option A: Using Nginx (Recommended)**

1. Install Nginx:
```bash
sudo apt update
sudo apt install nginx -y
```

2. Create Nginx configuration:
```bash
sudo nano /etc/nginx/sites-available/weconnect
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name 147.93.27.62;

    # Frontend
    location / {
        root /path/to/we-connect-crm-main/client/dist;
        try_files $uri $uri/ /index.html;
    }

    # API Proxy
    location /api {
        proxy_pass http://localhost:3010;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

3. Enable and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/weconnect /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**Option B: Using Simple HTTP Server**
```bash
cd client/dist
pm2 serve . 3001 --name "weconnect-frontend" --spa
pm2 save
```

---

## ✅ Step 5: Verify Deployment

### Check PM2 Status
```bash
pm2 status
pm2 logs weconnect-api
```

### Test API Health
```bash
curl http://localhost:3010/api/health
# Should return: {"status":"success","message":"API is running","timestamp":"..."}
```

### Test Frontend
Open browser: `http://147.93.27.62/` (if using Nginx)
Or: `http://147.93.27.62:3001/` (if using PM2 serve)

### Test Login
- Email: `admin@weconnect.com`
- Password: `admin123`

---

## 🔄 Quick Deployment Script (For Future Updates)

**One-Command Deployment:**
```bash
chmod +x deploy-vps.sh
./deploy-vps.sh
```

This will:
1. Pull latest code from Git
2. Install dependencies
3. Run migrations
4. Build backend and frontend
5. Restart PM2 services

---

## 📊 Monitoring & Maintenance

### View Logs
```bash
# API logs
pm2 logs weconnect-api

# Follow logs in real-time
pm2 logs weconnect-api --lines 100
```

### PM2 Commands
```bash
# List all processes
pm2 list

# Restart application
pm2 restart weconnect-api

# Stop application
pm2 stop weconnect-api

# Monitor resources
pm2 monit
```

### Database Backup
```bash
# Backup database
pg_dump -U postgres -d we_connect_crm > backup_$(date +%Y%m%d).sql

# Restore database
psql -U postgres -d we_connect_crm < backup_20260103.sql
```

---

## 🔒 Security Recommendations

1. **Change Default Admin Password** after first login
2. **Enable HTTPS** using Let's Encrypt:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```
3. **Configure Firewall:**
   ```bash
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw allow 22/tcp
   sudo ufw enable
   ```
4. **Regular Updates:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

---

## 🆘 Troubleshooting

### API Not Starting
```bash
# Check logs
pm2 logs weconnect-api --err

# Check if port is in use
lsof -i :3010

# Restart
pm2 restart weconnect-api
```

### Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -U postgres -d we_connect_crm -c "SELECT 1;"
```

### Frontend Build Issues
```bash
cd client
rm -rf node_modules dist
npm install
npm run build
```

---

## 📞 Support

For issues or questions:
1. Check logs: `pm2 logs`
2. Check database connection
3. Verify environment variables

---

## 🎉 Success!

Your WeConnect CRM is now live at:
- **Frontend:** http://147.93.27.62/
- **API:** http://147.93.27.62:3010/api
- **API Health:** http://147.93.27.62:3010/api/health

**Default Login:**
- Email: admin@weconnect.com
- Password: admin123

**🔐 IMPORTANT:** Change the default admin password immediately after first login!