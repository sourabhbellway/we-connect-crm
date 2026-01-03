# 🚀 WeConnect CRM - Production Deployment Guide (Hindi)

## ✅ Database Sync Complete Ho Gaya Hai!

Aapka PostgreSQL database successfully sync ho gaya hai. Ab live deployment karte hain.

---

## 📋 Step 1: VPS Par Login Karein

```bash
ssh your-user@147.93.27.62
```

Apne VPS par login karein aur project folder mein jaayein:
```bash
cd /path/to/we-connect-crm-main
```

---

## 🔧 Step 2: Production Environment Configure Karein

### Backend Configuration

**Important:** Production ke liye `.env` file update karein:
```bash
nano api/.env
```

**Ye changes zaroori hain:**
```env
NODE_ENV=production
DATABASE_URL=postgresql://postgres:APNA_PASSWORD@localhost:5432/we_connect_crm?schema=public
JWT_SECRET=koi-bahut-strong-random-string-dalein
```

### Frontend Configuration

```bash
nano client/.env.production
```

Confirm karein ki ye hai:
```env
VITE_API_BASE_URL=http://147.93.27.62:3010/api
APP_ENV=production
```

---

## 🗄️ Step 3: Database Setup (VPS Par)

```bash
cd api

# Dependencies install karein
npm install --production

# Prisma Client generate karein
npm run prisma:generate

# Database migrations apply karein
npm run prisma:migrate

# Admin user create karein
npm run seed
```

---

## 🏗️ Step 4: Build Karein

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

## 🚀 Step 5: PM2 Se Start Karein

```bash
cd api

# Logs folder banayein
mkdir -p logs

# PM2 se start karein
pm2 start ecosystem.config.js

# Configuration save karein
pm2 save

# Boot pe auto-start enable karein
pm2 startup
```

---

## 🌐 Step 6: Frontend Deploy Karein

**Option A: Nginx Use Karein (Recommended)**

```bash
sudo apt install nginx -y

# Nginx config banayein
sudo nano /etc/nginx/sites-available/weconnect
```

Is config ko paste karein:
```nginx
server {
    listen 80;
    server_name 147.93.27.62;

    location / {
        root /path/to/we-connect-crm-main/client/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3010;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable karein:
```bash
sudo ln -s /etc/nginx/sites-available/weconnect /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**Option B: Simple HTTP Server**
```bash
cd client/dist
pm2 serve . 3001 --name "weconnect-frontend" --spa
pm2 save
```

---

## ✅ Step 7: Check Karein Sab Kuch Chal Raha Hai

### PM2 Status Dekhein
```bash
pm2 status
pm2 logs weconnect-api
```

### API Test Karein
```bash
curl http://localhost:3010/api/health
```

### Browser Mein Kholen
- Frontend: `http://147.93.27.62/` (Nginx)
- Ya: `http://147.93.27.62:3001/` (PM2 serve)

### Login Karein
- Email: `admin@weconnect.com`
- Password: `admin123`

---

## 🔄 Future Updates Ke Liye

**Ek Command Mein Deploy:**
```bash
chmod +x deploy-vps.sh
./deploy-vps.sh
```

Ye automatically:
1. Latest code pull karega
2. Dependencies install karega
3. Build karega
4. Restart karega

---

## 📊 Monitoring

### Logs Dekhein
```bash
pm2 logs weconnect-api
```

### Restart Karein
```bash
pm2 restart weconnect-api
```

### Status Check Karein
```bash
pm2 list
```

---

## 🔒 Security Tips

1. **Admin password change karein** first login ke baad
2. **HTTPS enable karein** (SSL certificate)
3. **Firewall configure karein:**
   ```bash
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```
4. **Regular backups lein:**
   ```bash
   pg_dump -U postgres we_connect_crm > backup_$(date +%Y%m%d).sql
   ```

---

## 🆘 Problems Ho Toh

### API Start Nahi Ho Rahi
```bash
pm2 logs weconnect-api --err
pm2 restart weconnect-api
```

### Database Connect Nahi Ho Raha
```bash
sudo systemctl status postgresql
psql -U postgres -d we_connect_crm
```

### Build Fail Ho Rahi
```bash
cd client
rm -rf node_modules dist
npm install
npm run build
```

---

## 🎉 Congratulations!

Aapka WeConnect CRM ab live hai:

- **Website:** http://147.93.27.62/
- **API:** http://147.93.27.62:3010/api

**Login Details:**
- Email: admin@weconnect.com
- Password: admin123

**⚠️ IMPORTANT:** Login ke baad turant password change kar dein!

---

## ℹ️ Important Commands

```bash
# Status dekhna
pm2 status

# Logs dekhna
pm2 logs weconnect-api

# Restart karna
pm2 restart weconnect-api

# Stop karna
pm2 stop weconnect-api

# Database backup
pg_dump -U postgres we_connect_crm > backup.sql
```

---

**Agar koi problem aaye toh:**
1. PM2 logs check karein
2. Database connection check karein
3. Environment variables check karein

**Sab kuch ready hai! Good luck! 🚀**