# WeConnect CRM — Setup & Run Guide

This guide describes the complete setup for the monorepo: frontend (client) and backend (api).

## 1) Prerequisites
- Node.js 18+
- PostgreSQL 13+
- npm

## 2) Environment Variables
Create the following files from examples:

- api/.env
```
# Server
PORT=3001
APP_NAME=WeConnect CRM API

# Database
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB_NAME?schema=public

# Auth
JWT_SECRET=replace-with-strong-secret
JWT_EXPIRES_IN=86400
```

- client/.env (optional)
```
# Point frontend to API (default is /api via Vite proxy in dev)
VITE_API_BASE_URL=/api
```

## 3) Install Dependencies
```
# Frontend
npm --prefix client install

# Backend (NestJS)
npm --prefix api install
```

## 4) Database & Prisma
```
# Generate Prisma Client
npm --prefix api run prisma:generate

# Run migrations (deploy existing migrations or create yours)
npm --prefix api run prisma:migrate

# Optionally open Prisma Studio
npm --prefix api run prisma:studio
```

## 5) Development
```
# Start backend (NestJS)
npm --prefix api run start:dev

# In another terminal: start frontend (Vite)
npm --prefix client run dev
```

- Frontend dev server: http://localhost:5173
- API base URL (dev): http://localhost:3001/api

## 6) Production Builds
```
# Backend build
npm --prefix api run build

# Frontend build
npm --prefix client run build
```

## 7) Testing & Linting
```
# Frontend tests
npm --prefix client run test

# Frontend lint
npm --prefix client run lint

# Backend tests (Nest default)
npm --prefix api run test
```

## 8) Project Structure
- client/ — React + Vite + Tailwind + React Router + Context + Axios (RHF+Yup available)
- api/ — NestJS + Prisma; feature-based modules (auth, users) with config/, common/, database/

## 9) Notes
- Many design/feature planning markdown files are ignored from git to keep the repo clean.
- Use SETUP.md and README.md as the authoritative docs to onboard.
