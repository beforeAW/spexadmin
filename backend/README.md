# Spexadmin Backend

Fastify + TypeScript API for Spexadmin.

## Overview

- Fastify server with Helmet and CORS
- JWT authentication (`@fastify/jwt`)
- MongoDB via Mongoose
- Feature domains: Auth, Users, Groups, Events, RSVPs, Dashboard stats

## Project Structure

```
backend/
├── package.json
├── tsconfig.json
└── src/
		├── index.ts                # Server bootstrap, plugins, health, favicon
		├── config/
		│   └── database.ts         # Mongoose connect/disconnect
		├── middleware/
		│   └── auth.ts             # JWT verify + role guards
		├── models/
		│   ├── User.ts             # Users + password hashing
		│   ├── Group.ts            # Groups (members/managers)
		│   └── Event.ts            # Events + RSVPs
		└── routes/
				└── index.ts            # All API routes
```

## Requirements

- Node.js 18+ (recommended)
- MongoDB connection string

## Setup

```bash
cd backend
npm install
```

Create environment variables (e.g., `.env`):

```
# Server
PORT=3000
HOST=0.0.0.0

# Auth
JWT_SECRET=change-me-in-production

# Database
# Use server-only URI (no trailing database path) and explicit dbName to avoid case mismatches.
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=spexadmin
```

## Scripts

```bash
npm run dev      # Start Fastify with tsx in watch mode
npm run build    # Compile TypeScript to dist/
npm start        # Run compiled server (node dist/index.js)
npm run lint     # ESLint checks
npm run lint:fix # ESLint auto-fix
npm run format   # Prettier format
```

## Core Endpoints

- Root and health
  - `GET /` → API info
  - `GET /health` → health check
  - `GET /favicon.ico` → 204 (prevents default 404)

- Auth
  - `POST /api/auth/register` → create user, returns `{ user, token }`
  - `POST /api/auth/login` → returns `{ user, token }`
  - `GET /api/auth/me` → current user (JWT required)

- Current user
  - `GET /api/users/me`
  - `PUT /api/users/me`
  - `PUT /api/users/me/password`
  - `PUT /api/users/me/preferences`

- Users
  - `GET /api/users`
  - `POST /api/users` (admin)
  - `GET /api/users/:id`
  - `PUT /api/users/:id` (self or admin)
  - `DELETE /api/users/:id` (admin)

- Admin
  - `GET /api/admin/users`
  - `GET /api/admin/users/:userId`
  - `POST /api/admin/users`

- Groups
  - `GET /api/groups`
  - `GET /api/groups/:groupId`
  - `POST /api/groups` (admin/manager)
  - `PUT /api/groups/:groupId` (admin/manager)
  - `DELETE /api/groups/:groupId` (admin/manager)
  - Members: `POST|DELETE /api/groups/:groupId/members/:userId` (admin/manager/groupmanager)
  - Managers: `POST|DELETE /api/groups/:groupId/managers/:userId` (admin/manager)

- Events
  - `GET /api/events`
  - `GET /api/events/:id`
  - `POST /api/events` (admin/manager/groupmanager)
  - `PUT /api/events/:id` (admin/manager/groupmanager)
  - `DELETE /api/events/:id` (admin/manager/groupmanager)
  - Search: `GET /api/events/search?search=&status=&group=&startDate=&endDate=`

- RSVPs
  - Add/update: `POST /api/events/:eventId/rsvp/:userId` with body `{ status: "yes" | "no" }` (JWT)
  - Remove: `DELETE /api/events/:eventId/rsvp/:userId` (JWT)
  - By user: `GET /api/users/:userId/events`
  - Available to user: `GET /api/users/:userId/available-events`

- Dashboard
  - `GET /api/dashboard/stats` (admin/manager)

## Security & Middleware

- Helmet with CSP disabled (compatible defaults)
- CORS enabled with `origin: true`
- JWT via `@fastify/jwt`; role guards in `middleware/auth.ts`

## Deployment Notes

- Set `JWT_SECRET`, `MONGODB_URI`, and `MONGODB_DB_NAME` in the host environment.
- Prefer `MONGODB_URI` without a database path and set `MONGODB_DB_NAME` explicitly to prevent case conflicts (e.g., `TEST` vs `test`).
- Server binds to `HOST` and `PORT` (defaults: `0.0.0.0:3000`).

## Troubleshooting

- 409 on register: duplicate email (Mongo `11000`).
- 400 responses include `details` for validation errors.
- Database case mismatch: ensure `MONGODB_DB_NAME` matches the existing database name exactly.
- Favicon 404s avoided by `GET /favicon.ico` returning `204 No Content`.

## Code Style

- ESLint + Airbnb TypeScript config
- Prettier for formatting
