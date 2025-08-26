#!/bin/bash

# Database Backup Script for Prisma Migration
# This script creates a backup of the current database before migration

set -e

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="database_backup_${TIMESTAMP}.sql"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "🔄 Starting database backup..."

# Check if we're using PostgreSQL or SQLite
if [ "$DB_TYPE" = "postgres" ] || [ -n "$DB_HOST" ]; then
    # PostgreSQL backup
    if [ -z "$DB_HOST" ]; then
        DB_HOST="localhost"
    fi
    if [ -z "$DB_PORT" ]; then
        DB_PORT="5432"
    fi
    if [ -z "$DB_NAME" ]; then
        DB_NAME="crm_db"
    fi
    if [ -z "$DB_USER" ]; then
        DB_USER="postgres"
    fi
    
    echo "📦 Creating PostgreSQL backup..."
    PGPASSWORD="$DB_PASSWORD" pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" > "$BACKUP_DIR/$BACKUP_NAME"
    
    if [ $? -eq 0 ]; then
        echo "✅ PostgreSQL backup created successfully: $BACKUP_DIR/$BACKUP_NAME"
    else
        echo "❌ PostgreSQL backup failed"
        exit 1
    fi
else
    # SQLite backup
    if [ -f "database.sqlite" ]; then
        echo "📦 Creating SQLite backup..."
        cp database.sqlite "$BACKUP_DIR/database_${TIMESTAMP}.sqlite"
        echo "✅ SQLite backup created successfully: $BACKUP_DIR/database_${TIMESTAMP}.sqlite"
    else
        echo "❌ SQLite database file not found"
        exit 1
    fi
fi

echo "🎉 Database backup completed successfully!"
echo "📁 Backup location: $BACKUP_DIR"
