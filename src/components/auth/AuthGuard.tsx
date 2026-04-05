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
    const isDev = process.env.NEXT_PUBLIC_APP_MODE === "Development";
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
    const userRoles = session.user.roles || [];
    const userGroups = session.user.groups || [];

    if (!hasAccess(userRoles, userGroups, requiredRoles, requiredGroups)) {
        // In Development, we show a warning but allow bypass if the user intended to disable guards
        if (isDev) {
            console.warn(`[AuthGuard] Role check failed for ${requiredRoles.join(", ")}. Allowing bypass because APP_MODE="Development".`);
            return (
                <div className="relative border-2 border-dashed border-yellow-500/50 rounded-xl p-1 bg-yellow-500/5 overflow-hidden">
                    <div className="absolute top-0 right-0 bg-yellow-500 text-black text-[10px] font-black px-3 py-1 rounded-bl-xl z-[9999] shadow-2xl uppercase tracking-tighter flex items-center gap-1.5 border-b border-l border-yellow-600">
                        <span className="w-2 h-2 rounded-full bg-black animate-ping" />
                        DEV BYPASS ACTIVE
                    </div>
                    {children}
                </div>
            );

        }
        return <>{fallbackComponent}</>;
    }

    return <>{children}</>;
}
