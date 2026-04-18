import { auth } from "@/lib/auth/auth";
import { NextResponse } from "next/server";
import { UserType, hasAccess } from "@/lib/auth/utils";

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;
    const userRoles = req.auth?.user?.roles;
    const userGroups = req.auth?.user?.groups;

    // Paths that require specific roles
    const roleMappedPaths: { path: string; roles: UserType[] }[] = [
        { path: "/admin", roles: [UserType.ADMIN] },
        { path: "/manager", roles: [UserType.MANAGER, UserType.ADMIN] },
        { path: "/instructor", roles: [UserType.INSTRUCTOR, UserType.MANAGER, UserType.ADMIN] },
        { path: "/student", roles: [UserType.STUDENT, UserType.ADMIN] },
    ];

    const currentPath = nextUrl.pathname;

    // Public paths
    const isPublicPath = currentPath === "/" || currentPath.startsWith("/auth");

    if (isPublicPath) {
        return NextResponse.next();
    }

    if (!isLoggedIn) {
        return NextResponse.redirect(new URL("/auth/login", nextUrl));
    }

    // Check RBAC
    for (const { path, roles } of roleMappedPaths) {
        if (currentPath === path || currentPath.startsWith(path + "/")) {
            if (!hasAccess(userRoles, userGroups, roles)) {
                return NextResponse.redirect(new URL("/not-found", nextUrl)); // Or a specialized Access Denied page
            }
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
