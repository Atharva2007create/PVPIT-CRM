# PVPIT Student CRM Backend

Portable Node.js and Express foundation for the unified PVPIT Student CRM. Phase 1 establishes configuration, MongoDB connectivity, layered structure, security middleware, response contracts, health endpoints, validation utilities, and the two-role authorization foundation.

This is a non-production MVP. Authentication, JWT issuance, users, student profiles, academics, attendance, notifications, and every other business module are intentionally deferred.

## Technology

- Node.js 22.8+
- Express 5
- MongoDB with Mongoose
- Zod, dotenv, CORS, Helmet, Morgan
- Node test runner and Supertest

## Structure

```text
src/
  config/        environment and database lifecycle
  constants/     two-role authorization foundation
  controllers/   HTTP translation
  middleware/    request IDs, validation, errors, authorization helpers
  repositories/  data/infrastructure access boundary
  routes/        central route registration
  services/      application logic
  utils/         errors, responses, async and pagination helpers
```

Request flow is `route -> controller -> service -> repository -> database adapter`. MongoDB access stays behind the repository layer.

## Quick start

```powershell
Copy-Item .env.example .env
npm install
npm test
npm run dev
```

Edit `.env` before starting. Never commit it. Detailed instructions are in [docs/SETUP.md](docs/SETUP.md).

## Scripts

- `npm run dev` — run with Node watch mode
- `npm start` — run without watch mode
- `npm test` — run the Phase 1 test suite
- `npm run test:watch` — run tests in watch mode
- `npm run test:coverage` — collect test coverage

## Active endpoints

- `GET /health`
- `GET /api/v1`
- `GET /api/v1/health`

See [docs/API.md](docs/API.md) and [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Deferred work

Later approved phases will add authentication and the student/administrator workflows. Phase 1 contains no login, password hashing, tokens, CRUD, uploads, notifications, queues, cloud-provider integration, analytics, reports, or frontend code.
