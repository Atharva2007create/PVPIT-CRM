# Backend setup

## Requirements

- Node.js 22.8 or newer
- npm
- A reachable local MongoDB or Atlas deployment

## Configure

```powershell
Copy-Item .env.example .env
notepad .env
```

Required runtime variables:

| Variable | Purpose |
|---|---|
| `NODE_ENV` | `development`, `test`, or `production` |
| `PORT` | API port |
| `MONGODB_URI` | MongoDB connection URI |
| `JWT_SECRET` | Random secret with at least 32 characters |
| `JWT_EXPIRES_IN` | Access-token lifetime, for example `15m` |
| `PASSWORD_MIN_LENGTH` | Configurable minimum, 8–128 |
| `CLIENT_ORIGIN` | Exact allowed browser origin |
| `STUDENT_EMAIL_PATTERN` | Approved student-email regular expression |
| `ADMINISTRATOR_EMAIL_PATTERN` | Approved administrator-email regular expression |

The repository does not contain confirmed institutional formats. The `example.test` expressions are development placeholders and must be replaced with formats approved by PVPIT before real account creation.

## First administrator

Set `INITIAL_ADMIN_NAME`, `INITIAL_ADMIN_EMAIL`, and `INITIAL_ADMIN_PASSWORD`, then manually run:

```powershell
npm run bootstrap:admin
```

The command validates the administrator pattern, hashes the password, and creates at most one account per email. It does not run during server startup and never prints the password. Remove bootstrap values from the local environment when finished.

## Verify and run

```powershell
npm install
npm test
npm run dev
```

No migration, seed, frontend, notification, upload, or deployment operation is part of Phase 2.
