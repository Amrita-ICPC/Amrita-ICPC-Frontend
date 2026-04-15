"use client";

import { useSession } from "next-auth/react";
import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lock } from "lucide-react";
import { logger } from "@/lib/logger";
import { hasAccess } from "@/lib/auth/permissions";

interface AuthGuardProps {
    children: ReactNode;
    requiredRoles?: string[];
    requiredGroups?: string[];
    fallback?: ReactNode;
    redirectTo?: string;
}

/**
 * AuthGuard component restricts access to protected content based on user roles/groups.
 *
 * Usage:
 * <AuthGuard requiredRoles={["admin"]}>
 *   <AdminPanel />
 * </AuthGuard>
 *
 * @param children - Content to render if authorized
 * @param requiredRoles - Array of required roles (any match grants access)
 * @param requiredGroups - Array of required groups (any match grants access)
 * @param fallback - Content to show if unauthorized (default: error alert)
 * @param redirectTo - URL to redirect to if unauthorized (takes precedence over fallback)
 */
export function AuthGuard({
    children,
    requiredRoles = [],
    requiredGroups = [],
    fallback,
    redirectTo,
}: AuthGuardProps) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            logger.warn("Unauthenticated user accessing protected resource, redirecting to login");
            router.push("/auth/login");
            return;
        }

        if (status === "authenticated" && session?.user) {
            const hasRequiredAccess = hasAccess(
                session.user.roles || [],
                session.user.groups || [],
                requiredRoles,
                requiredGroups,
            );

            if (!hasRequiredAccess) {
                logger.warn(
                    {
                        userId: session.user.id,
                        userRoles: session.user.roles,
                        userGroups: session.user.groups,
                        requiredRoles,
                        requiredGroups,
                    },
                    "User access denied - insufficient permissions",
                );

                if (redirectTo) {
                    router.push(redirectTo);
                }
            }
        }
    }, [session, status, redirectTo, router, requiredRoles, requiredGroups]);

    // Loading state
    if (status === "loading") {
        return (
            <div className="flex items-center justify-center min-h-screen text-white">
                Loading...
            </div>
        );
    }

    // Unauthenticated
    if (status === "unauthenticated") {
        return null;
    }

    // Authenticated
    if (status === "authenticated" && session?.user) {
        const hasRequiredAccess = hasAccess(
            session.user.roles || [],
            session.user.groups || [],
            requiredRoles,
            requiredGroups,
        );

        if (!hasRequiredAccess) {
            if (fallback) {
                return fallback;
            }

            // Default fallback: error alert
            return (
                <div className="flex items-center justify-center min-h-screen p-6">
                    <Alert variant="destructive" className="max-w-md">
                        <Lock className="h-5 w-5" />
                        <AlertTitle>Access Denied</AlertTitle>
                        <AlertDescription>
                            You do not have the required permissions to access this resource.
                        </AlertDescription>
                    </Alert>
                </div>
            );
        }

        return <>{children}</>;
    }

    return null;
}
