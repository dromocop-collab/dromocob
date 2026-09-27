# Hafız Production Architecture

## Runtime boundaries

- SwiftUI iOS app authenticates with Firebase Identity Toolkit and sends a short-lived ID token to Dromocob.
- Every `/api/hafiz/**` handler calls `requireHafizContext`; role, active membership, institution and account status are loaded from trusted Firebase Auth/Firestore data.
- Repository functions apply tenant, ownership, relationship and state-transition checks before data access.
- Firestore and Storage client rules deny every Hafız collection/object. Admin SDK API routes are the only data plane.
- Quran text is canonical imported data. Students receive only assignment-scoped resolver output.
- Audio is stored under `hafiz-private-audio`; teachers receive bytes only through an owner- and tenant-checked no-store endpoint.

## Administration

The admin shell covers institutions, role-specific users, classes, relationship links, Quran import/validation, dashboard counts, system configuration, workflow presets, revision presets, audit events and account state. Institution admins stay in their tenant. Cross-tenant administration additionally requires the trusted `hafizPlatformAdmin` Firebase custom claim.

All list endpoints are bounded. Directory and audit feeds use opaque cursors. Firestore aggregation queries are used for dashboard counts instead of loading documents.

## Historical data

Assignments publish immutable revisions; recipients retain `assignedRevisionNumber`. Progress, reviews, mastery and audit records are append-only histories. Account deletion is soft (`DELETED`, `deletedAt`, `deletedBy`) and disables Firebase Auth.

## Client cache

Authenticated API traffic uses an ephemeral `URLSession`, `no-store` responses and no cookie store. Logout/account switch removes URL cache plus memorize/audio outbox keys. Quran content is not persisted as a general library.

## Registration and approval

Self-registration first creates a Firebase identity and a `PENDING` record in `hafiz_registration_requests`. It does not create an active membership, role profile or authorization scope. The authenticated applicant may read only their own request status. An authorized admin approves or rejects the request; approval atomically creates the membership, role profile and user scope and records an audit event. The iOS client retains the refresh token while pending and restores the trusted role shell automatically after approval without requiring another login.
