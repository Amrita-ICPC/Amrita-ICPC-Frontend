import { auth } from "@/lib/auth/auth";
import { NextResponse } from "next/server";
import { UserType, hasAccess } from "@/lib/auth/utils";

export default auth((req) => {
    const { nextUrl } = req;
    const pathname = nextUrl.pathname;
    const session = req.auth;

    // Public paths — always allow
    if (pathname === "/" || pathname.startsWith("/auth")) {
        return NextResponse.next();
    }

    // Not authenticated — redirect to login
    if (!session?.user) {
        const loginUrl = new URL("/auth/login", nextUrl);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    const userRoles = session.user.roles;
    const userGroups = session.user.groups;

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
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
