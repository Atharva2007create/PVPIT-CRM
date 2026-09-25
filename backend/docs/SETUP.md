# Backend setup

## Requirements

- Node.js 22.8 or newer
- npm
- A reachable MongoDB deployment, local or Atlas

## Configure

From the `backend` directory:

```powershell
Copy-Item .env.example .env
notepad .env
```

Set all five variables:

| Variable | Purpose |
|---|---|
| `NODE_ENV` | `development`, `test`, or `production` |
| `PORT` | API listening port |
| `MONGODB_URI` | MongoDB connection URI |
| `JWT_SECRET` | Reserved for later authentication; use 32+ random characters |
| `CLIENT_ORIGIN` | Exact allowed browser origin |

For Atlas, create a database user, allow the development machine's IP in Network Access, and paste the driver URI into `MONGODB_URI`. URL-encode special characters in credentials. Do not commit `.env` or share its contents.

## Install, verify, and run

```powershell
npm install
npm test
npm run dev
```

In another terminal:

```powershell
Invoke-RestMethod http://localhost:5000/health
Invoke-RestMethod http://localhost:5000/api/v1
Invoke-RestMethod http://localhost:5000/api/v1/health
```

Use `npm start` for a non-watch process. A startup configuration or MongoDB failure produces a clear message and a non-zero exit code.

No seed, migration, backup, upload, or deployment operation is part of Phase 1.
