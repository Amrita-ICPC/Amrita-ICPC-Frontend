"use client";

import Loading from "@/app/loading";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
    UserType,
    type Role,
    belongsToRequiredGroup,
    hasRequiredPermission,
} from "@/lib/auth/utils";
import AccessDenied from "./access-denied";

interface AuthGuardProps {
    children: React.ReactNode;
    requiredRoles?: Role[];
    requiredGroups?: UserType[];
    fallbackComponent?: React.ReactNode;
}

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

    // Check if user has required access
    const userRoles = session.user.roles; // permission strings
    const userGroups = session.user.groups;

    const hasGroups =
        requiredGroups.length === 0 ? true : belongsToRequiredGroup(userGroups, requiredGroups);

    const hasRoles =
        requiredRoles.length === 0 ? true : hasRequiredPermission(userRoles, requiredRoles);

    if (!hasGroups || !hasRoles) {
        return <>{fallbackComponent}</>;
    }

    return <>{children}</>;
}
