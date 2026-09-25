# API reference

Base URL: `http://localhost:5000`

## Foundation

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/health` | Public | Unversioned health check |
| GET | `/api/v1` | Public | API version, phase, and roles |
| GET | `/api/v1/health` | Public | Versioned health check |

## Authentication

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/api/v1/auth/login` | Public | Validate credentials and issue an access token |
| GET | `/api/v1/auth/me` | Bearer token | Return the safe current-user identity |
| POST | `/api/v1/auth/logout` | Bearer token | Increment token version and revoke existing tokens |

Login accepts only `email` and `password`; a client-supplied role is rejected by strict validation. A successful response includes the Bearer access token, expiration data, and safe user identity:

```json
{
  "success": true,
  "data": {
    "accessToken": "token",
    "tokenType": "Bearer",
    "expiresIn": 900,
    "expiresAt": "2026-09-25T12:00:00.000Z",
    "user": {
      "id": "MongoDB ID",
      "name": "User Name",
      "email": "normalized@example.test",
      "role": "student",
      "workflow": "student",
      "status": "active",
      "permissions": ["identity:authenticated"]
    }
  },
  "message": "Login successful"
}
```

Use `Authorization: Bearer <token>` for protected endpoints. Password hashes, token versions, secrets, and database configuration are never returned.

Errors use the Phase 1 contract:

```json
{
  "success": false,
  "error": { "code": "INVALID_CREDENTIALS", "message": "Invalid email or password" },
  "requestId": "correlation-id"
}
```

Common statuses are `401` for missing/invalid/expired/revoked authentication, `403` for suspended accounts or insufficient authorization, `422` for malformed data or configured email-pattern violations, and `409` for duplicate resources.

All business-module paths remain inactive and return `404`.
