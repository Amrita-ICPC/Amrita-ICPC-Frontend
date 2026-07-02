"use client";

import { redirect, usePathname } from "next/navigation";

import AccessDenied from "./access-denied";

export default function StudentRouteEnforcer({
    children,
    isStudent,
}: {
    children: React.ReactNode;
    isStudent: boolean;
}) {
    const pathname = usePathname();
    const allowedSharedPaths = ["/invitation", "/settings"];

    if (isStudent && !pathname.startsWith("/student") && !allowedSharedPaths.includes(pathname)) {
        if (pathname === "/dashboard") {
            redirect("/student/dashboard");
        }
        return <AccessDenied />;
    }

    return <>{children}</>;
}
