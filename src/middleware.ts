import { auth } from "@/auth";
import { NextResponse } from "next/server";

/**
 * Global Edge Middleware
 * Handles route protection and role-based redirects.
 */
export default auth((req: any) => {
    const isDev = process.env.NEXT_PUBLIC_APP_MODE === "Development";
    // Short-circuit all checks in local dev for a smoother experience
    if (isDev) return NextResponse.next();

    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;

    // Define protected routes that require specific roles
    const urlPath = nextUrl.pathname;

    const isApiAuthRoute = urlPath.startsWith("/api/auth");
    const isPublicRoute = urlPath === "/" || urlPath.startsWith("/auth/login");

    if (isApiAuthRoute) {
        return NextResponse.next();
    }

    if (!isLoggedIn && !isPublicRoute) {
        let callbackUrl = nextUrl.pathname;
        if (nextUrl.search) {
            callbackUrl += nextUrl.search;
        }

        const encodedCallbackUrl = encodeURIComponent(callbackUrl);
        return NextResponse.redirect(
            new URL(`/auth/login?callbackUrl=${encodedCallbackUrl}`, nextUrl)
        );
    }

    // Role-based edge blocking
    const userRoles = req.auth?.user?.roles || [];

    if (urlPath.startsWith("/dashboard/@admin") && !userRoles.includes("ADMIN")) {
        return NextResponse.redirect(new URL("/access-denied", nextUrl));
    }

    if (urlPath.startsWith("/dashboard/@manager") && !userRoles.includes("MANAGER")) {
        return NextResponse.redirect(new URL("/access-denied", nextUrl));
    }

    if (urlPath.startsWith("/dashboard/@coach") && !userRoles.includes("COACH")) {
        return NextResponse.redirect(new URL("/access-denied", nextUrl));
    }

    // The Parallel Routes intercept based on URL but also layout composition. 
    // Edge middleware mainly focuses on hard path restrictions. 
    
    return NextResponse.next();
});

export const config = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
