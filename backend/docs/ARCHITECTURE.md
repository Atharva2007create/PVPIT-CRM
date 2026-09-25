# Backend architecture

## System boundary

PVPIT CRM is one unified application with one backend and one MongoDB database. It will support exactly two roles: `student` and `administrator`. After authentication is implemented in a later phase, the server will return the role and permissions needed for the frontend to select the appropriate workflow. Server-side authorization will remain authoritative.

## Phase 1 flow

```text
HTTP request
  -> security, CORS, parsing, logging, request ID
  -> central router
  -> controller
  -> service
  -> repository
  -> MongoDB connection adapter
  -> standard response or central error handler
```

The Express app is created separately from server startup so tests do not open ports or databases. The server connects to MongoDB before listening and disconnects on `SIGINT` or `SIGTERM`.

## Authorization foundation

The role constants contain only `student` and `administrator`. Phase 1 has no protected routes, accounts, passwords, tokens, or persisted user model. Permission constants only reserve each workflow boundary; domain permissions will be introduced with the routes that enforce them.

## Portability and security

Configuration comes only from environment variables. Helmet sets security headers, CORS accepts the configured client origin, body sizes are limited, request IDs correlate errors, and production responses never expose stack traces. The data layer uses Mongoose without cloud-specific services.

## Deferred phases

- Authentication, role routing, user accounts, profiles, academics, and attendance
- Mentoring, risk, skills, projects, certifications, and achievements
- Internships, training, placement, scholarships, and documents
- Grievances, requests, communication, search, counselling, and feedback
- Alumni, dashboards, analytics, reports, accreditation, deployment, and production hardening

Notifications, external email/SMS, Redis, queues, AWS/S3, SSO, and frontend implementation are not part of Phase 1.
