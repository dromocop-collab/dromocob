# Hafız Phase 1 backend foundation

Hafız temporarily uses Dromocob's existing Firebase Authentication project. This is an adapter boundary, not a second authentication system.

## Trusted session flow

1. The iOS app reads the public Firebase client configuration from `GET /api/public/mobile-config?app=hafiz`.
2. Firebase Authentication issues an ID token and refresh token.
3. The refresh token is stored in iOS Keychain with a device-only accessibility class. The ID token remains in memory.
4. `GET /api/hafiz/session` verifies the Firebase token with revocation checking and reloads the Firebase user.
5. The server resolves the active membership and institution. The client never submits its own role or institution.

## Required Firestore documents

The Admin SDK or a future admin workflow must provision these documents. Direct client access remains denied by `firestore.rules`.

```text
hafiz_user_scopes/{firebaseUid}
  status: "ACTIVE"
  activeMembershipId: "membership-id"

hafiz_memberships/{membershipId}
  status: "ACTIVE"
  userId: "firebase-uid"
  institutionId: "institution-id"
  role: "STUDENT" | "TEACHER" | "PARENT" | "ADMIN"

hafiz_institutions/{institutionId}
  status: "ACTIVE"
  name: "Kurum adı"
```

The resolver checks all three records on every trusted session request. A disabled Firebase user, revoked token, inactive membership, mismatched user, invalid role, or inactive institution is denied before any role shell is returned.

## Migration boundary

The iOS UI depends on `AuthenticationService`, not Firebase or Dromocob DTOs. A future backend migration replaces the remote adapter while preserving `AppSession`, authorization policy, routing, and feature shells.
