import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { hasAccess } from "@/lib/auth/utils";

/**
 * Global Edge Proxy
 * Handles route protection and role-based redirects.
 */
export const proxy = auth((req) => {
    const isDev = process.env.NEXT_PUBLIC_APP_MODE === "Development";
    const host = req.headers.get("host");

    // Short-circuit check: only allow dev-bypass on development env
    if (isDev) {
        return NextResponse.next();
    }

    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;

    // Define protected routes that require specific roles
    const urlPath = nextUrl.pathname;

    const isApiAuthRoute = urlPath.startsWith("/api/auth");
    const isPublicRoute = urlPath === "/" || urlPath.startsWith("/auth/login") || urlPath === "/access-denied";

    if (isApiAuthRoute) {
        return NextResponse.next();
    }

    // Helper: checks if the url is exactly the segment or starts with the segment + "/"
    const matchesSegment = (path: string, segment: string) => path === segment || path.startsWith(`${segment}/`);

    // Redirect to base dashboard if user is authenticated but on a login page
    if (isLoggedIn && urlPath.startsWith("/auth/login")) {
        return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }


    // General authentication check (Public Access)
    if (!isLoggedIn && !isPublicRoute) {
        let callbackUrl = nextUrl.pathname;
        if (nextUrl.search) callbackUrl += nextUrl.search;
        return NextResponse.redirect(new URL(`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`, nextUrl));
    }

    // Role-Based Authorization Enforcement
    const userRoles = req.auth?.user?.roles || [];
    const userGroups = req.auth?.user?.groups || [];

    // Dashboard Sub-path Protection (RBAC)
    const subRouteMappings = [
        { path: "/dashboard/admin", roles: ["ADMIN"] },
        { path: "/dashboard/manager", roles: ["MANAGER"] },
        { path: "/dashboard/coach", roles: ["COACH"] },
        { path: "/dashboard/student", roles: ["STUDENT"] },
    ];

    for (const mapping of subRouteMappings) {
        if (matchesSegment(urlPath, mapping.path)) {
            const hasPathAccess = hasAccess(userRoles, userGroups, mapping.roles, []);
            if (!hasPathAccess) return NextResponse.redirect(new URL("/access-denied", nextUrl));
        }
    }

    // General /dashboard protection: Require at least ONE recognized role to enter the dashboard
    if (matchesSegment(urlPath, "/dashboard")) {
        const hasAnyRecognizedRole = hasAccess(userRoles, userGroups, ["ADMIN", "COACH", "MANAGER", "STUDENT"], []);
        if (!hasAnyRecognizedRole) return NextResponse.redirect(new URL("/access-denied", nextUrl));
    }


    // The Parallel Routes intercept based on URL but also layout composition. 
    // Edge middleware mainly focuses on hard path restrictions. 
    
    return NextResponse.next();
});

export const config = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
