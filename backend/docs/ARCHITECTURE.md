# Backend architecture

## Unified boundary

PVPIT CRM has one Express backend, one MongoDB database, one User collection, and one authentication system. The only active roles are `student` and `administrator`. Additional staff designations are deferred and can be added later through centralized role and permission mappings.

## Request flow

```text
HTTP request
  -> security, CORS, parsing, logging, request ID
  -> router and Zod validation
  -> requireAuth / requireRole / requirePermission
  -> controller
  -> service
  -> repository
  -> Mongoose model
  -> standard response or central error handler
```

Controllers translate HTTP, services own authentication decisions, repositories isolate database access, and models define persistence. The Express app is separate from startup so tests do not open ports or connect to Atlas.

## Authentication authority

Login never accepts a role. Configured email patterns determine whether an address is structurally eligible, but the stored MongoDB role is the authorization authority. A pattern/role disagreement is rejected. JWTs contain only subject ID, role, token version, issuer, issued time, and expiration.

For each protected request, middleware verifies the signature and expiry, loads the current user, checks active status, compares the stored role and token version, and attaches a safe identity. Logout atomically increments `tokenVersion`, invalidating previously issued tokens.

## Security and portability

Passwords are hashed with bcryptjs and never selected by ordinary queries or serialized. Configuration is environment-only. Helmet, exact-origin CORS, body limits, request IDs, safe errors, and graceful MongoDB shutdown remain active. No AWS, Redis, queues, external identity provider, notification service, or frontend code is included.
