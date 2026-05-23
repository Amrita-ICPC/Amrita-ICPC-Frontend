"use client";

import { usePathname, redirect } from "next/navigation";
import AccessDenied from "./access-denied";

export default function StudentRouteEnforcer({
    children,
    isStudent,
}: {
    children: React.ReactNode;
    isStudent: boolean;
}) {
    const pathname = usePathname();

    if (isStudent && !pathname.startsWith("/student") && pathname !== "/invitation") {
        if (pathname === "/dashboard") {
            redirect("/student/dashboard");
        }
        return <AccessDenied />;
    }

    return <>{children}</>;
}
