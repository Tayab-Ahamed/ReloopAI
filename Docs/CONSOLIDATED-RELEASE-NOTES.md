# Consolidated release hardening notes

## Upload reliability update

- Feedback now supports up to five images per submission.
- Profile photos are optimized for avatar display.
- Donation and feedback photos are optimized for detail while reducing upload time.

## Implemented security controls

- Server-side authorization now protects administrative, donation, AI, and upload actions.
- Webhook requests require a timestamped HMAC-SHA256 signature, event ID, replay-window enforcement, and durable idempotency records.
- AI routes require authentication, role authorization, per-client rate limits, ownership checks for listing mutation, bounded input, and URL validation that rejects non-HTTPS/private-network image hosts.
- Uploads require authentication, a permitted logical folder, rate limits, strict data-URL MIME parsing, signature checks, a 5 MB decoded-size cap, random object names, and configured object storage. Development fallback URLs were removed.
- Donation creation derives the donor from the authenticated identity. Acceptance uses an atomic pending/unassigned transition. Delivery now requires a single-use, HMAC-protected confirmation code; plaintext codes are not persisted or returned to API callers.
- API runtime has restrictive CORS, security response headers, disabled Express fingerprinting, request-size limits, sanitized error responses, and protected maps proxy access.
- CI and Docker now use reproducible `npm ci` installation. CI runs backend tests and frontend typecheck, lint, and build.

## Operational configuration

Webhook senders must include `x-reloop-event-id`, `x-reloop-timestamp` (Unix seconds), and `x-reloop-signature`. The signature is the lowercase hex HMAC-SHA256 of `${timestamp}.${rawJsonBody}` using `N8N_SECRET`.

## Validation status

See `Docs/P0.1-VALIDATION.md` for the sandbox dependency-network limitation. Backend unit/static checks are executable without downloaded dependencies and are run in the release validation command set.


## Additional production hardening

- Registration and password-reset OTP records are now bcrypt-hashed, scoped by purpose, expire automatically, enforce a five-attempt limit, and are consumed after successful registration or password reset.
- Production email delivery fails closed when SendGrid is not configured; recipient, subject, and body values are not written to logs.
- AI mock providers are rejected when `NODE_ENV=production`.
- Impact certificates now use an authenticated external rendering service (`CERTIFICATE_SERVICE_URL` and `CERTIFICATE_SERVICE_TOKEN`) and require an HTTPS URL response; placeholder certificate links are no longer returned.
- Render deployment uses `npm ci --omit=dev`, sets `NODE_ENV=production`, and requires production AI, storage, and certificate-service configuration rather than mock providers.
- Donation record reads enforce donor/recipient/Admin ownership. NGO matching binds the listing to the authenticated donor, requires configured Google geocoding, and never manufactures coordinates or exposes NGO email addresses.

## Sandbox validation limitation

Backend syntax, YAML parsing, static security checks, and the six built-in backend tests pass. Both backend and frontend `npm ci --ignore-scripts` attempts remain blocked by the sandbox npm runtime (`Exit handler never called`), so dependency-backed API integration tests and the frontend typecheck/lint/build cannot be executed in this environment.
- Feedback submission now requires that the authenticated NGO is the receiver of a delivered donation; feedback retrieval is limited to the donor, receiver, or an administrator.
