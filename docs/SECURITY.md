# Hafız Security Controls

## Authorization order

1. Verify Firebase ID token with revocation checking.
2. Reject disabled Firebase users.
3. Load active user scope, membership and institution.
4. Read role from membership; never from request data.
5. Apply tenant access (`requireInstitutionAccess`).
6. Apply resource ownership/link/class/grant/state policy.

IDs, routes and deep links are untrusted. Resource-not-found and forbidden paths use non-enumerating 403 responses. Generic 500 responses do not expose stack traces or secrets.

## Role controls

- Student: own recipient only; assignment Quran grant only; workflow transition engine rejects locked/teacher-controlled steps.
- Teacher: own authorized classes/students/assignments only; review approval is a teacher-only transaction.
- Parent: active `ParentStudentLink` read-only projection; private/student-only notes and Quran text are excluded.
- Admin: own institution by default; platform claim required for another institution.

## Data and files

- `firestore.rules`: all `hafiz_*` collections are client-denied, including system config and workflow presets.
- `storage.rules`: private audio denies direct client reads/writes.
- Audio endpoint returns no permanent URL and sets `private, no-store`, `nosniff` and `Vary: Authorization`.
- Push lock-screen bodies redact teacher messages/notes. Payloads must not contain Quran text, notes, student names, tokens or file URLs.
- Logs use operation labels and generic client errors; do not log bearer tokens, Quran text or audio bytes.

## Secrets

Secrets belong in the deployment secret manager. Never commit Firebase Admin private keys, APNs `.p8` contents or cron secrets. Rotate on suspected exposure. Firebase web API key is configuration, but must still be restricted to intended APIs/apps.

## Residual controls before launch

Run Firebase Emulator integration tests, deploy/test rules in a staging project, enable rate limiting/WAF for public API traffic, perform dependency/secret scanning, verify backups and restore, and complete privacy/retention review.

## Registration boundary

- Public registration accepts only an already verified Firebase identity; it never trusts a client-supplied user id or grants `ADMIN`.
- Requested institution and role remain inactive until an authorized admin decision.
- Pending applicants can poll only their own non-sensitive status and cannot access role APIs.
- Firestore rules deny direct reads and writes to `hafiz_registration_requests`.
- Approval creates authorization records in one server transaction and writes an audit event; rejection creates no scope.
- Production ingress must rate-limit registration attempts and protect the endpoint against automated abuse.
