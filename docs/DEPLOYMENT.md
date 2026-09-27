# Hafız Deployment

## Required environment

Firebase Admin (service account or workload identity):

- `FIREBASE_ADMIN_PROJECT_ID` (fallbacks exist, explicit production value required)
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`
- `FIREBASE_ADMIN_STORAGE_BUCKET`

Firebase client authentication configuration:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`

Notifications:

- `APNS_TEAM_ID`
- `APNS_KEY_ID`
- `APNS_PRIVATE_KEY` (secret content of `.p8`, never the file in source control)
- `HAFIZ_NOTIFICATION_CRON_SECRET`

## Required deployment order

1. Create a staging Firebase project and backups.
2. Deploy `firestore.rules`, `storage.rules` and `firestore.indexes.json`.
3. Wait until all composite indexes are ready.
4. Configure secrets and workload identity/service account least privilege.
5. Deploy the Next.js service; run session/admin/negative authorization smoke tests.
6. Configure the notification scheduler to POST the internal route with the cron bearer secret.
7. Build iOS Release with HTTPS `DromocobBaseURL`, production APNs entitlement and correct bundle ID.
8. Run manual QA below before production traffic.

## Rollback

Application deploys may roll back without reverting data. Never delete assignment revisions, progress, reviews or audit events during rollback. Restore rules and indexes only from reviewed version-controlled files.

## Registration deployment

Deploy the updated Firestore rules and composite index before exposing registration. Confirm the registration endpoint is behind HTTPS, ingress rate limiting and abuse monitoring. Institution codes currently resolve to canonical institution document identifiers, so distribute them only through the intended institution onboarding process. Smoke-test pending, rejected and approved paths; approval must open the existing signed-in session without another password prompt.
