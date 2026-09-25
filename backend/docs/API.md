# Phase 1 API

Base URL: `http://localhost:5000`

Only the following public foundation endpoints are active.

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | Unversioned operational health check |
| GET | `/api/v1` | API identity, phase, version, and supported roles |
| GET | `/api/v1/health` | Versioned operational health check |

Health data includes API status, runtime environment, MongoDB connection status, server time, and API version. It never returns configuration values or credentials.

Successful responses use:

```json
{
  "success": true,
  "data": {},
  "message": "Request successful"
}
```

Errors use:

```json
{
  "success": false,
  "error": {
    "code": "ROUTE_NOT_FOUND",
    "message": "Route GET /missing was not found"
  },
  "requestId": "request-correlation-id"
}
```

All authentication and business endpoints are deferred and return the standard `404` response in this phase. The frontend must not integrate with undocumented routes.
