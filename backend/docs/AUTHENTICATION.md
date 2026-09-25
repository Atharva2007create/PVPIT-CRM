# Authentication and authorization

## Login

1. Zod accepts only email and password.
2. The email is trimmed and lowercased.
3. Centralized configured patterns establish eligible role formats.
4. The account is loaded from MongoDB with its password hash.
5. Suspended accounts are rejected.
6. bcrypt verifies the password.
7. The configured email format must agree with the stored role.
8. The token is signed using the stored role and token version.
9. The API returns safe identity, basic permissions, and either the `student` or `administrator` workflow.

Unknown emails and wrong passwords return the same `Invalid email or password` response. A role is never accepted from the client.

## Protected requests and logout

`requireAuth` reads a Bearer token, verifies its signature and expiry, reloads the account, confirms active status, and compares role and token version. `requireRole` and `requirePermission` provide centralized 403 authorization checks.

Logout increments the stored token version. Every older token then fails authentication. This MVP does not issue refresh tokens and does not claim rotation or multi-device session management.

## Current limitations

- Exactly two active roles; future staff designations are not implemented.
- No registration endpoints or administrator self-registration.
- No refresh tokens, password reset, email verification, SSO, cookies, or external identity provider.
- Email patterns are replaceable validation aids, not authorization authority.
- Notifications and all student lifecycle business modules remain deferred.
