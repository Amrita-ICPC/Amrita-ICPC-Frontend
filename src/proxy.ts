import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

import { hasAccess, UserType } from "@/lib/auth/utils";

export default async function proxy(req: NextRequest) {
    const { nextUrl } = req;
    const pathname = nextUrl.pathname;
    const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
    });

    // Public paths — always allow
    if (pathname === "/" || pathname.startsWith("/auth")) {
        return NextResponse.next();
    }

    // Not authenticated — redirect to login
    if (!token || token.error) {
        const loginUrl = new URL("/auth/login", nextUrl);
        loginUrl.searchParams.set("callbackUrl", `${pathname}${nextUrl.search}`);
        return NextResponse.redirect(loginUrl);
    }

    const userRoles = token.roles;
    const userGroups = token.groups;

    // RBAC for specific path prefixes
    const roleMappedPaths: { path: string; roles: UserType[] }[] = [
        { path: "/admin", roles: [UserType.ADMIN] },
        { path: "/manager", roles: [UserType.MANAGER, UserType.ADMIN] },
        { path: "/instructor", roles: [UserType.INSTRUCTOR, UserType.MANAGER, UserType.ADMIN] },
        { path: "/student", roles: [UserType.STUDENT, UserType.ADMIN] },
    ];

    for (const { path, roles } of roleMappedPaths) {
        if (pathname === path || pathname.startsWith(path + "/")) {
            if (!hasAccess(userRoles, userGroups, roles)) {
                return NextResponse.redirect(new URL("/not-found", nextUrl));
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
