#!/bin/bash

# WeConnect CRM Database Backup Script
# यह script database को file में export करेगा

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🗄️  WeConnect CRM Database Backup${NC}"
echo ""

# Check if .env file exists
if [ -f "api/.env" ]; then
    # Try to extract DATABASE_URL from .env
    DB_URL=$(grep DATABASE_URL api/.env | cut -d '=' -f2-)
    
    if [ ! -z "$DB_URL" ]; then
        # Parse DATABASE_URL
        # Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
        DB_USER=$(echo $DB_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
        DB_PASS=$(echo $DB_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
        DB_HOST=$(echo $DB_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
        DB_PORT=$(echo $DB_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
        DB_NAME=$(echo $DB_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
        
        echo -e "${YELLOW}📋 Database Info:${NC}"
        echo "  User: $DB_USER"
        echo "  Host: $DB_HOST"
        echo "  Port: $DB_PORT"
        echo "  Database: $DB_NAME"
        echo ""
    fi
fi

# Default values (अगर .env से parse नहीं हो पाया)
DB_USER=${DB_USER:-"weconnect_user"}
DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-"5432"}
DB_NAME=${DB_NAME:-"weconnect_crm"}

# Ask for credentials if not found
if [ -z "$DB_USER" ] || [ "$DB_USER" == "USER" ]; then
    read -p "Database User: " DB_USER
fi

if [ -z "$DB_NAME" ] || [ "$DB_NAME" == "DB_NAME" ]; then
    read -p "Database Name: " DB_NAME
fi

# Backup directory
BACKUP_DIR="./database-backups"
mkdir -p $BACKUP_DIR

# Timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Backup file name
BACKUP_FILE="$BACKUP_DIR/weconnect_crm_backup_${TIMESTAMP}.sql"

echo -e "${YELLOW}🔄 Creating database backup...${NC}"

# Check if password is available
if [ ! -z "$DB_PASS" ] && [ "$DB_PASS" != "PASSWORD" ]; then
    # Use password from .env
    export PGPASSWORD=$DB_PASS
    pg_dump -U $DB_USER -h $DB_HOST -p $DB_PORT -d $DB_NAME > $BACKUP_FILE
else
    # Ask for password
    echo -e "${YELLOW}Enter database password for user $DB_USER:${NC}"
    pg_dump -U $DB_USER -h $DB_HOST -p $DB_PORT -d $DB_NAME > $BACKUP_FILE
fi

if [ $? -eq 0 ]; then
    # Compress the backup
    echo -e "${YELLOW}📦 Compressing backup...${NC}"
    gzip $BACKUP_FILE
    BACKUP_FILE="${BACKUP_FILE}.gz"
    
    # Get file size
    FILE_SIZE=$(du -h $BACKUP_FILE | cut -f1)
    
    echo ""
    echo -e "${GREEN}✅ Backup created successfully!${NC}"
    echo ""
    echo -e "${BLUE}📁 Backup Details:${NC}"
    echo "  File: $BACKUP_FILE"
    echo "  Size: $FILE_SIZE"
    echo "  Location: $(pwd)/$BACKUP_DIR"
    echo ""
    echo -e "${YELLOW}💡 To restore this backup:${NC}"
    echo "  gunzip < $BACKUP_FILE | psql -U $DB_USER -d $DB_NAME"
    echo ""
else
    echo -e "${RED}❌ Backup failed!${NC}"
    echo "Please check:"
    echo "  1. PostgreSQL is running"
    echo "  2. Database credentials are correct"
    echo "  3. User has proper permissions"
    exit 1
fi

