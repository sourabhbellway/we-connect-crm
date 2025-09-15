# CRM Application Setup Guide

## Issue Resolution: Filter Not Working (500 Error)

The filter functionality was experiencing a 500 Internal Server Error due to several issues that have been fixed:

### Fixed Issues:

1. **Database Connection**: Updated API base URL to use localhost instead of remote server
2. **Search Query**: Removed unsupported `mode: "insensitive"` from Prisma queries
3. **Status Filtering**: Fixed case sensitivity issue between frontend (lowercase) and database (uppercase)
4. **Pagination Validation**: Added proper validation for page and limit parameters
5. **Error Handling**: Improved error handling for database connection issues

## Quick Setup

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (running on localhost:5432)
- npm or yarn

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Database Setup

```bash
# Run the setup script (creates .env, runs migrations, seeds data)
npm run server:setup
```

### 3. Start the Application

```bash
# Option 1: Start both frontend and backend together
npm run dev:full

# Option 2: Start them separately
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run dev
```

## Manual Setup (if automated setup fails)

### 1. Database Configuration

Make sure PostgreSQL is running and create a database:

```sql
CREATE DATABASE crm_db;
```

### 2. Environment Variables

Create `.env` file in the `server` directory:

```env
DATABASE_URL="postgresql://postgres:Sourabh@123@localhost:5432/crm_db"
DB_HOST=localhost
DB_PORT=5432
DB_NAME=crm_db
DB_USER=postgres
DB_PASSWORD=Sourabh@123
PORT=3001
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
API_BASE_URL=http://localhost:3001/api
```

### 3. Database Migration

```bash
cd server
npx prisma generate
npx prisma migrate deploy
npm run db:seed
```

### 4. Test Database Connection

```bash
cd server
npm run test-db
```

## Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running on port 5432
- Check database credentials in `.env` file
- Verify database `crm_db` exists

### Filter Issues

- Clear browser cache and reload
- Check browser console for errors
- Verify server is running on port 3001

### API Errors

- Check server logs for detailed error messages
- Ensure all environment variables are set correctly
- Verify CORS configuration matches your frontend URL

## API Endpoints

The application now uses localhost:3001 for the API:

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api

## Key Changes Made

1. **Fixed Search Functionality**: Removed unsupported Prisma query options
2. **Fixed Status Filtering**: Added proper case conversion
3. **Improved Error Handling**: Better error messages and validation
4. **Updated API URLs**: Changed from remote server to localhost
5. **Added Setup Scripts**: Automated database setup and testing

## Testing the Fix

After setup, test the filter functionality:

1. Go to the Leads page
2. Try searching for leads
3. Filter by status
4. Change pagination settings

All filters should now work without 500 errors.
