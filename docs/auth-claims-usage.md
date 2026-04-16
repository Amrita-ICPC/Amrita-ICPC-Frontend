# Auth Claims Usage: Roles, Groups, Permissions

This project uses Keycloak through NextAuth. Claims are read from the access token and exposed on the session.

## Where Claims Come From

- Realm roles: `realm_access.roles`
- Resource permissions: `resource_access.<client>.roles`
- Groups: `groups`

Current mapping in the app:

- `session.user.roles`: realm roles and resource roles combined (kept for backward compatibility)
- `session.user.permissions`: resource roles only (example: `questions:create`)
- `session.user.groups`: group names with leading slash removed (example: `/admin` becomes `admin`)

## Debug View

For quick checking in the UI, claims are printed on the dashboard page:

- Route: `/dashboard`
- File: `src/app/(app)/dashboard/page.tsx`

## Server-Side Usage (recommended)

Use `auth()` in server components, layouts, and route handlers.

```ts
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  const canCreateQuestions = session.user.permissions.includes("questions:create");
  const isAdminGroup = session.user.groups.includes("admin");
  const hasDefaultRealmRole = session.user.roles.includes("default-roles-icpc");

  if (!canCreateQuestions) {
    return <div>Not authorized</div>;
  }

  return <div>Authorized content</div>;
}
```

## Client-Side Usage

Use `useSession()` from `next-auth/react`.

```tsx
"use client";

import { useSession } from "next-auth/react";

export function PermissionGate() {
    const { data: session, status } = useSession();

    if (status === "loading") return <div>Loading...</div>;

    const canDeleteContest = session?.user?.permissions?.includes("contests:delete");

    return canDeleteContest ? <button>Delete Contest</button> : null;
}
```

## Utility Helpers

Helpers are available in `src/lib/auth/utils.ts`:

- `hasRequiredPermission(userPermissions, requiredPermissions)`
- `belongsToRequiredGroup(userGroups, requiredGroups)`
- `hasPermission(user, requiredPermissions)`
- `belongsToGroup(user, requiredGroups)`
- `hasAccess(userRoles, userGroups, requiredRoles, requiredGroups)`

Example:

```ts
import { hasPermission, belongsToGroup } from "@/lib/auth/utils";

const canReadBanks = hasPermission(session?.user, ["banks:read"]);
const isAdmin = belongsToGroup(session?.user, ["admin"]);
```

## Notes

- `decodeJwt` decodes claims only; it does not verify signature.
- In this app, tokens come from the trusted NextAuth OAuth callback flow.
- For external or untrusted JWT input, use signature verification.
