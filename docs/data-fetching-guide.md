# Data Fetching Architecture Guide

This guide outlines our standard architecture for safely fetching data across the Amrita ICPC platform. It acts as a strict standard on traversing through the Next.js App Router boundary, protecting API credentials natively while delivering a beautiful, cache-managed Client UI via TanStack Query.

---

## 1. Server-Side Data Fetching

When operating purely within **Next.js Server Components** or **Server Actions** (`src/server/services/*`), you must fetch data utilizing Axios via our internal initialized Server API Client.

**Why?** The Server API Client automatically injects authorization header validations natively by invoking session cookies and resolving routing to the actual Backend systems without exposing environments externally.

**Example: Creating a Server Fetcher (`src/server/services/example-service.ts`)**

```typescript
import "server-only"; // Guarantees this file cannot be bundled to browsers
import { getServerApiClient } from "@/lib/api/server";

export async function getExampleServer(params: Record<string, any>) {
    // Await the setup of the internal secure API client
    const api = await getServerApiClient();

    // Directly call the microservice/backend over internal APIs
    const response = await api.get("/examples", { params });

    return response.data;
}
```

---

## 2. API Route Handlers (Boundary Endpoints)

Because Client UI Components cannot securely hold secrets, we craft **"Boundary Endpoints"**. These are standard Next.js API Routes (located at `src/app/api/.../route.ts`) acting as proxies that bridge web traffic into server operations.

**Standard Rules for Boundaries:**

1. Export `dynamic = "force-dynamic"` to ensure routes do not improperly compile statically.
2. If handling heavy dynamic data (like DB filters), inject specific `Cache-Control` headers.
3. Offload backend calls to your defined Server-Side fetcher.

**Example: Boundary Route (`src/app/api/examples/route.ts`)**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getExampleServer } from "@/server/services/example-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        // 1. Extract raw search parameters safely from the browser URI
        const params = Object.fromEntries(req.nextUrl.searchParams);

        // 2. Safely call backend infrastructure securely
        const data = await getExampleServer(params);

        // 3. Return cleanly shaped JSON (Optional: explicit Cache logic)
        return NextResponse.json(data, {
            headers: {
                "Cache-Control": "no-store, max-age=0",
            },
        });
    } catch (error: unknown) {
        return NextResponse.json({ message: "Proxy Failed" }, { status: 500 });
    }
}
```

---

## 3. TanStack Query (Client-Side State Management)

Client-Side `useEffect` logic scales incredibly poorly due to unhandled promise cascades. Instead, we wrap standard DOM `fetch` functionality using **TanStack React Query**, granting robust caching, optimistic updating, and beautiful skeleton-loader boolean mappings (`isLoading`).

**Step A: Define the Fetcher and React Query Hook (`src/query/example-query.ts`)**

```typescript
import { useQuery, keepPreviousData } from "@tanstack/react-query";

// 1. Execute a native DOM fetch hitting our exact boundary route
async function fetchExampleBoundary(params: any) {
    const searchParams = new URLSearchParams(params).toString();

    // Include `cache: 'no-store'` so aggressive browsers do not cache API data
    const res = await fetch(`/api/examples?${searchParams}`, {
        cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to load generic data");
    return res.json();
}

// 2. Export a wrapper hook for UI components
export function useExampleQuery(params: any = {}) {
    return useQuery({
        // UNIQUE AND EXPLICIT destructuring of Query Keys
        queryKey: ["examples", params.page, params.search],
        queryFn: () => fetchExampleBoundary(params),
        // Maintains current Grid details until the next Page's API resolves completely
        placeholderData: keepPreviousData,
    });
}
```

**Step B: Orchestrate Data inside Client Components (`src/components/.../client.tsx`)**

```tsx
"use client";

import { useExampleQuery } from "@/query/example-query";
import { SkeletonLoader } from "@/components/ui/skeleton";

export function ExampleView() {
    // 1. Destructure reactive bindings effortlessly
    const { data, isLoading, error } = useExampleQuery({ page: 1 });

    if (isLoading) return <SkeletonLoader count={8} />;

    if (error) return <div className="text-destructive">{error.message}</div>;

    return (
        <div>
            {data.items.map((item) => (
                <ExampleCard key={item.id} data={item} />
            ))}
        </div>
    );
}
```
