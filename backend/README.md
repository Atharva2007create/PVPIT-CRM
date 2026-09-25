# PVPIT Student CRM Backend

Portable Node.js and Express backend for the unified PVPIT Student CRM. Phase 1 provides the application foundation; Phase 2 adds unified accounts, password hashing, JWT access-token authentication, logout invalidation, and centralized role authorization.

This is a non-production MVP with exactly two active roles: `student` and `administrator`. Both use one User model, API, authentication system, and MongoDB database. Business modules and frontend code remain deferred.

## Technology

- Node.js 22.8+, Express 5, MongoDB/Mongoose
- Zod, dotenv, Helmet, CORS, Morgan
- bcryptjs password hashing and jsonwebtoken access tokens
- Node test runner and Supertest

## Setup

```powershell
Copy-Item .env.example .env
npm install
npm test
npm run dev
```

Replace all development placeholders in `.env`; never commit that file. See [docs/SETUP.md](docs/SETUP.md).

## Commands

- `npm run dev` — development server with watch mode
- `npm start` — server without watch mode
- `npm run bootstrap:admin` — manually create the first administrator, idempotently
- `npm test` — Phase 1 and Phase 2 tests
- `npm run test:coverage` — test coverage

## Active endpoints

- `GET /health`
- `GET /api/v1`
- `GET /api/v1/health`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/logout`

See [docs/API.md](docs/API.md), [docs/AUTHENTICATION.md](docs/AUTHENTICATION.md), and [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Current limitations

There is no public registration, administrator self-registration, refresh-token rotation, password reset, email verification, SSO, notifications, or business-module API. HTTP-only cookie support and production session controls are future upgrades.
