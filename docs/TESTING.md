# Hafız Testing and Release Gate

## Repository commands

```bash
npm run lint
npx tsc --noEmit
npm run test:hafiz
npm run build
```

iOS:

```bash
xcrun swift-format lint --recursive Hafiz HafizTests
xcodebuild -project Hafiz.xcodeproj -scheme Hafiz -destination 'generic/platform=iOS Simulator' CODE_SIGNING_ALLOWED=NO build
xcodebuild -project Hafiz.xcodeproj -scheme Hafiz -destination '<installed simulator>' test
```

## Security matrix

Negative tests cover cross-student assignments/Quran/audio, locked steps, forged completion/review, unlinked parents, private notes, parent mutations, teacher tenant/class/student forgery, platform-admin scope and direct database/storage denial.

## Manual QA checklist

- Disable an active user and confirm the next API call and relaunch deny access.
- Soft-delete a test user; verify Firebase Auth disabled and history retained.
- Try copied student/assignment/audio IDs across accounts and institutions.
- Verify parents see only active linked children and `PARENT_VISIBLE` notes.
- Verify student Quran navigation cannot move beyond its grant.
- Publish a new assignment revision and confirm existing progress stays pinned.
- Logout/account switch and confirm Quran/audio/outbox data is absent.
- Validate Quran dataset provenance/checksum before import.
- Exercise admin pagination/filtering with more than 50 records.
- Confirm push lock-screen text contains no private note/message content.
- Upload/retry audio and verify no permanent public URL exists.
- Inspect production logs for tokens, private notes, Quran text and audio data.

Live Firebase Emulator integration and staging rules tests are mandatory before claiming production readiness.

## Registration tests

Automated security coverage verifies that self-registration is identity-bound, requested roles exclude `ADMIN`, pending requests precede all membership/scope creation, admin review routes require trusted admin authorization, and direct Firestore access is denied. Manual staging QA must also verify duplicate-email recovery, pending-session restoration, rejection messaging and automatic access immediately after approval.
