# Prisma Migration Deployment Guide

## Overview

This guide covers the safe deployment of the Prisma migration to your VPS with AlmaLinux and Nginx reverse proxy.

## Pre-Deployment Checklist

### 1. VPS Infrastructure Verification

- [ ] Confirm PostgreSQL is running and accessible
- [ ] Verify Nginx configuration is working
- [ ] Check available disk space (minimum 2GB free)
- [ ] Confirm Node.js version (18+ recommended)
- [ ] Verify PM2 or similar process manager is installed

### 2. Database Preparation

- [ ] Create full database backup
- [ ] Test backup restoration process
- [ ] Verify database connection credentials
- [ ] Check PostgreSQL version compatibility (12+)

### 3. Application Preparation

- [ ] Test Prisma migration locally
- [ ] Verify all controllers work with Prisma
- [ ] Run comprehensive test suite
- [ ] Update environment variables

## Deployment Steps

### Step 1: Create Backup Branch

```bash
# On your local machine
git checkout -b backup-sequelize
git push origin backup-sequelize
git checkout main
```

### Step 2: Prepare VPS Environment

```bash
# SSH into your VPS
ssh user@your-vps-ip

# Navigate to project directory
cd /path/to/your/project

# Create backup of current deployment
cp -r server server-backup-$(date +%Y%m%d)

# Backup database
sudo -u postgres pg_dump your_database_name > backup_$(date +%Y%m%d).sql
```

### Step 3: Update Environment Variables

```bash
# Edit your .env file
nano server/.env

# Add/update these variables:
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
NODE_ENV=production
```

### Step 4: Deploy New Code

```bash
# Pull latest code
git pull origin main

# Install new dependencies
cd server
npm install

# Generate Prisma client
npx prisma generate

# Run database migration
npx prisma migrate deploy

# Build the application
npm run build
```

### Step 5: Test Deployment

```bash
# Test database connection
npx prisma db pull

# Start application in test mode
NODE_ENV=production npm start

# Test API endpoints
curl http://localhost:3000/api/health
```

### Step 6: Update Process Manager

```bash
# If using PM2
pm2 restart your-app-name

# If using systemd
sudo systemctl restart your-app-service

# If using Docker
docker-compose up -d --build
```

### Step 7: Verify Nginx Configuration

```bash
# Test Nginx configuration
sudo nginx -t

# Reload Nginx if needed
sudo systemctl reload nginx

# Check Nginx status
sudo systemctl status nginx
```

## Rollback Procedure

### Quick Rollback (if needed)

```bash
# Stop current application
pm2 stop your-app-name

# Restore backup
rm -rf server
cp -r server-backup-$(date +%Y%m%d) server

# Restore database if needed
sudo -u postgres psql your_database_name < backup_$(date +%Y%m%d).sql

# Restart application
pm2 start your-app-name
```

### Git Rollback

```bash
# Switch to backup branch
git checkout backup-sequelize

# Force push to main (if needed)
git push origin backup-sequelize:main --force
```

## Post-Deployment Verification

### 1. Health Checks

- [ ] API endpoints responding correctly
- [ ] Database queries working
- [ ] Authentication working
- [ ] File uploads working
- [ ] Email functionality working

### 2. Performance Monitoring

- [ ] Check application logs
- [ ] Monitor database performance
- [ ] Verify memory usage
- [ ] Check CPU usage
- [ ] Monitor response times

### 3. Security Verification

- [ ] SSL certificates valid
- [ ] Firewall rules intact
- [ ] Database connections secure
- [ ] Environment variables secure

## Monitoring Commands

### Application Monitoring

```bash
# Check PM2 status
pm2 status

# View application logs
pm2 logs your-app-name

# Monitor system resources
htop
```

### Database Monitoring

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Monitor database connections
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"

# Check database size
sudo -u postgres psql -c "SELECT pg_size_pretty(pg_database_size('your_database_name'));"
```

### Nginx Monitoring

```bash
# Check Nginx status
sudo systemctl status nginx

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Test Nginx configuration
sudo nginx -t
```

## Troubleshooting

### Common Issues

1. **Prisma Client Generation Fails**

   ```bash
   # Clear Prisma cache
   rm -rf node_modules/.prisma
   npm install
   npx prisma generate
   ```

2. **Database Connection Issues**

   ```bash
   # Test database connection
   npx prisma db pull

   # Check PostgreSQL logs
   sudo tail -f /var/log/postgresql/postgresql-*.log
   ```

3. **Migration Conflicts**

   ```bash
   # Reset migrations (DANGEROUS - only in development)
   npx prisma migrate reset

   # Or create new migration
   npx prisma migrate dev --name fix-conflicts
   ```

4. **Performance Issues**

   ```bash
   # Check slow queries
   sudo -u postgres psql -c "SELECT * FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"

   # Analyze Prisma queries
   # Add logging to your application
   ```

## Maintenance

### Regular Tasks

- [ ] Monitor application logs daily
- [ ] Check database performance weekly
- [ ] Update Prisma client monthly
- [ ] Review and clean old backups monthly
- [ ] Test backup restoration quarterly

### Security Updates

- [ ] Keep Node.js updated
- [ ] Keep PostgreSQL updated
- [ ] Keep Nginx updated
- [ ] Monitor security advisories
- [ ] Update SSL certificates

## Support

If you encounter issues during deployment:

1. Check the troubleshooting section above
2. Review application and system logs
3. Test in staging environment first
4. Contact your system administrator
5. Consider rolling back to previous version

## Notes

- Always test in staging environment first
- Keep multiple backups before major changes
- Monitor application performance after deployment
- Document any custom configurations
- Keep rollback procedures ready
