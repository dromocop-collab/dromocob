# Hafız Data Model

Every protected document carries `institutionId` where applicable. IDs supplied by clients never establish ownership.

## Identity and directory

- `hafiz_institutions`
- `hafiz_user_scopes`
- `hafiz_memberships`
- `hafiz_teacher_profiles`, `hafiz_student_profiles`, `hafiz_parent_profiles`
- `hafiz_classes`, `hafiz_class_memberships`, `hafiz_teacher_class_assignments`
- `hafiz_parent_student_links`

Account states are `ACTIVE`, `DISABLED`, `DELETED`; membership authorization accepts only `ACTIVE`. Deletion is soft and audited.

## Quran and assignments

- Canonical: `hafiz_quran_editions`, `juzs`, `surahs`, `pages`, `ayahs`, `imports`
- Assignments: `hafiz_assignments`, immutable `hafiz_assignment_revisions`, `hafiz_assignment_recipients`, exact `hafiz_assignment_quran_grants`
- Workflow: append-only `hafiz_progress_events`, help/difficulty records
- Review: private audio metadata, reviews, approvals and mastery/revision history

No Quran text is duplicated into assignments. A revision snapshots stable edition checksum/version and exact page/ayah identifiers.

## Operations

- `hafiz_system_config`: tenant timezone and controlled feature settings; never secrets
- `hafiz_workflow_presets`: tenant-scoped, versionable workflow definitions
- `hafiz_revision_templates` and schedules/history
- `hafiz_audit_events`: actor, action, resource, safe metadata, server timestamp
- notification preferences, rate buckets, tokens and notification records

All mutations use server timestamps. Referential checks occur in transactions before related records are changed. Firestore cannot provide relational foreign keys, so orphan/integrity scans must be part of scheduled operations and pre-release checks.

## Registration approval

- `hafiz_registration_requests`: one request per Firebase uid with normalized email, display name, requested non-admin role, institution reference, `PENDING | APPROVED | REJECTED` status and creation/review audit fields.
- Approval atomically creates or activates the canonical membership, role profile and user scope. The request record is retained for auditability.
- Rejection retains the identity and request history but creates no application authorization.
