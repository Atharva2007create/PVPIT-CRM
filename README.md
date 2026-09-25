# PVPIT Student CRM

Unified Student CRM for PVPIT Engineering College. The repository currently contains the Phase 1 backend foundation and Phase 2 authentication/account foundation. It remains a non-production MVP and exposes no business-module APIs yet.

The system has exactly two planned application roles:

- `student`
- `administrator`

Both workflows will use one frontend, one Express API, one authentication system, and one MongoDB database. See [backend/README.md](backend/README.md) for setup and current scope.

Authentication uses one User model, JWT access tokens, and server-side role authorization for both workflows. No frontend files are included or modified.
