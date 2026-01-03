# ✅ Production Deployment Checklist

## Pre-Deployment (Local)

- [x] Database synced successfully
- [x] All migrations applied
- [x] Prisma Client generated
- [ ] Code tested locally
- [ ] Environment files reviewed

## Server Setup (VPS - 147.93.27.62)

### Essential Software
- [ ] Node.js v22 installed
- [ ] PostgreSQL installed and running
- [ ] PM2 installed globally (`npm install -g pm2`)
- [ ] Git configured

### Security
- [ ] SSH key authentication set up
- [ ] Firewall configured (UFW)
- [ ] Strong PostgreSQL password set
- [ ] JWT_SECRET changed from default

### Database
- [ ] PostgreSQL database created (`we_connect_crm`)
- [ ] Database user and permissions configured
- [ ] DATABASE_URL updated in `api/.env`
- [ ] Migrations applied on production
- [ ] Initial seed data created

### Application Files
- [ ] Code pushed to Git repository
- [ ] Code pulled on VPS
- [ ] `api/.env` configured with production values
- [ ] `client/.env.production` configured
- [ ] Dependencies installed (api & client)
- [ ] Backend built (`npm run build`)
- [ ] Frontend built (`npm run build`)

### Deployment
- [ ] PM2 process started
- [ ] PM2 saved configuration
- [ ] PM2 startup script configured
- [ ] Nginx/HTTP server configured
- [ ] API health check passing
- [ ] Frontend accessible

### Post-Deployment
- [ ] Admin login works
- [ ] Default password changed
- [ ] Email functionality tested
- [ ] All major features tested
- [ ] Logs reviewed for errors
- [ ] Backup strategy in place

## Quick Commands

### On VPS:
```bash
# Navigate to project
cd /path/to/we-connect-crm-main

# Quick deploy (after initial setup)
./deploy-vps.sh

# Check status
pm2 status
pm2 logs weconnect-api

# Restart if needed
pm2 restart weconnect-api
```

### Access Points:
- Frontend: http://147.93.27.62/
- API: http://147.93.27.62:3010/api
- Health: http://147.93.27.62:3010/api/health

### Default Login:
- Email: admin@weconnect.com
- Password: admin123 (CHANGE THIS!)

---

## Next Steps After Going Live

1. **Test Everything:**
   - Login functionality
   - Lead creation
   - Deal management
   - Email sending
   - File uploads
   - Reports

2. **Monitor:**
   - Check PM2 logs regularly
   - Monitor server resources
   - Set up alerts (optional)

3. **Backup:**
   - Set up automated database backups
   - Document backup restoration procedure

4. **Security:**
   - Change all default passwords
   - Enable HTTPS with SSL certificate
   - Regular security updates

5. **Documentation:**
   - Document any custom configurations
   - Keep deployment notes updated
   - Train users on the system