# Amrita ICPC Frontend

Next.js 16 (App Router) exam/contest platform for Amrita University's ICPC program.

## Stack

- **Framework**: Next.js 16 App Router, React 19
- **Auth**: next-auth v4 (Keycloak SSO) — NOT v5. Use `authOptions`/`getServerSession`, not `auth()` from next-auth
- **Styling**: Tailwind CSS v4, shadcn/ui components, next-themes (class-based dark mode)
- **Data fetching**: TanStack Query v5 + orval-generated API clients (axios)
- **Runtime**: Bun

## Auth Pattern (next-auth v4)

```ts
// Route handler — src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth/auth";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

// Server component session
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
const session = await getServerSession(authOptions);

// Client signout (client components)
import { signOut } from "next-auth/react";
signOut({ callbackUrl: "/auth/login" });
```

`src/lib/auth/auth.ts` may export small v4 helpers, but they should wrap
`authOptions`/`getServerSession`. Do not use NextAuth v5 `auth()`,
`signIn`, `signOut`, or middleware `req.auth` patterns.

## Commands

```bash
bun dev          # dev server
bun run build    # production build
bun run lint     # ESLint
bun run typecheck # tsc --noEmit
bun run generate-api # regenerate API clients from OpenAPI spec
```

Pre-push hook runs `lint && typecheck` — fix all TS/ESLint errors before pushing.

## Project Structure

```text
src/
  app/
    (app)/          # authenticated app shell (sidebar layout)
      dashboard/
      contest/
      banks/
      questions/
      teams/
    (landing-page)/ # public landing
    auth/login/     # Keycloak redirect page
    api/auth/[...nextauth]/route.ts
  components/
    global/         # sidebar, nav-links, auth-guard, logout-button, theme-toggle
    contest/        # contest card, filters, client
    banks/          # bank list, card, dialogs
    questions/      # question wizard
    ui/             # shadcn primitives
  lib/
    auth/           # auth.ts (authOptions, handler, auth), types, utils
    api/            # axios client
    providers/      # SessionProvider, ThemeProvider, QueryClient
  api/generated/    # orval-generated API clients — DO NOT EDIT MANUALLY
  types/            # shared TypeScript types
```

## Theme System

CSS variables in `globals.css`. Sidebar is always dark in both light and dark modes.

- Light: `--background` = slate-50, `--primary` = indigo-600
- Dark: `--background` = slate-950, `--primary` = indigo-400
- Sidebar vars: `--sidebar`, `--sidebar-foreground`, `--sidebar-primary`, `--sidebar-accent`, `--sidebar-border`

Use `bg-sidebar`, `text-sidebar-foreground` etc. in sidebar components.
Use `bg-background`, `text-foreground`, `bg-card`, `border-border` in content areas.

## Role System

Users have `roles` (permission strings like `contests:read`) and `groups` (UserType enum: ADMIN, MANAGER, INSTRUCTOR, STUDENT).

```ts
import { hasPermission, UserType } from "@/lib/auth/utils";
hasPermission(session?.user, ["contests:create"]);
```

## Generated API

Run `bun run generate-api` after backend OpenAPI spec changes. Files in `src/api/generated/` are auto-generated — never edit them.

API base URL configured via `NEXT_PUBLIC_API_URL` env var.

## Key Env Vars

```bash
AUTH_KEYCLOAK_ID
AUTH_KEYCLOAK_SECRET
AUTH_KEYCLOAK_ISSUER
NEXTAUTH_SECRET
NEXTAUTH_URL
NEXT_PUBLIC_API_URL
```

## Page Design Pattern

All list pages follow this structure:

```text
<PageHeader>          title + subtitle + action button (server component)
<Toolbar>             search input | filter selects | <ViewToggle />
<Content>             grid (cards) OR table rows — driven by ViewToggle state
<AppPagination>       URL-based pagination, justify-end
```

### Shared components

| Component       | Path                                   | Purpose                              |
| --------------- | -------------------------------------- | ------------------------------------ |
| `AppPagination` | `components/shared/app-pagination.tsx` | Reusable URL-driven pagination       |
| `ViewToggle`    | `components/shared/view-toggle.tsx`    | Grid/table toggle button pair        |
| `Header`        | `components/global/header.tsx`         | Sticky breadcrumb + back/forward nav |

### Conventions

- Grid: `grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3` (adjust for density)
- Cards: `border-border/60 hover:border-primary/40 hover:shadow-md transition-all`
- Table rows: `group cursor-pointer hover:bg-muted/40 transition-colors`
- Icon containers: `flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10` with `text-primary`
- Empty state: `min-h-[200px] flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-muted-foreground`
- Error state: `border-destructive/30 bg-destructive/5 text-destructive`
- Status badges: use `border-transparent` with `bg-*/10 text-*` for colored badges

### Page header (server)

```tsx
<div className="flex items-center justify-between">
    <div>
        <h1 className="text-2xl font-bold tracking-tight">Page Title</h1>
        <p className="text-sm text-muted-foreground">Subtitle</p>
    </div>
    <ActionButton />
</div>
```

### Detail pages

Contest detail at `/contest/[id]` uses `ContestDetailClient` which fetches via `useGetContestApiV1ContestsContestIdGet`. Pattern:

1. Hero banner (name + badges + dates + creator)
2. Stat cards grid (teams / questions / submissions / participants)
3. Detail cards (schedule, config, rules)
4. Meta footer (created/updated timestamps)
