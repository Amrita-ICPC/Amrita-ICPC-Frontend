"use client";

import Loading from "@/app/loading";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { UserType, hasAccess } from "@/lib/auth/utils";
import AccessDenied from "./access-denied";

interface AuthGuardProps {
    children: React.ReactNode;
    requiredRoles?: UserType[];
    requiredGroups?: string[];
    fallbackComponent?: React.ReactNode;
}

/**
 * Client-Side Authorization Guard
 * 
 * Verifies that the user has a valid session and the required roles/groups.
 * Handles loading states and redirects to the login page if unauthenticated.
 */
export default function AuthGuard({
    children,
    requiredRoles = [],
    requiredGroups = [],
    fallbackComponent = <AccessDenied />,
}: AuthGuardProps) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "loading") return;

        if (!session?.user) {
            router.push("/auth/login");
        }
    }, [session, status, router]);

    if (status === "loading") {
        return <Loading />;
    }

    if (!session?.user) {
        return null;
    }
    const userRoles = (session.user as any).roles || [];
    const userGroups = (session.user as any).groups || [];

    if (!hasAccess(userRoles, userGroups, requiredRoles, requiredGroups)) {
        return <>{fallbackComponent}</>;
    }

    return <>{children}</>;
}
