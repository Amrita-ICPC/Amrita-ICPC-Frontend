import { redirect } from "next/navigation";

import AuthGuard from "@/components/global/auth-guard";
import { Header } from "@/components/global/header";
import Sidenavbar from "@/components/global/sidenavbar";
import StudentRouteEnforcer from "@/components/global/student-route-enforcer";
import { auth } from "@/lib/auth/auth";
import { getDefaultRoute, UserType } from "@/lib/auth/utils";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();

    if (!session?.user || session.error) {
        redirect("/auth/login");
    }

    const userRoles = session.user.roles || [];
    const userGroups = session.user.groups || [];
    const allRoles = [...userRoles, ...userGroups];

    const hasRole = (role: UserType) =>
        allRoles.some((r) => r.toLowerCase() === role.toLowerCase());

    const hasAnyRole =
        hasRole(UserType.ADMIN) ||
        hasRole(UserType.MANAGER) ||
        hasRole(UserType.INSTRUCTOR) ||
        hasRole(UserType.STUDENT);

    if (!hasAnyRole) {
        logger.warn(
            `User ${session.user.email} (ID: ${session.user.id}) has no recognized roles. Roles found: ${userRoles.join(", ")}`,
        );
    }

    const isStudent = getDefaultRoute(session.user) === "/student/dashboard";

    return (
        <div className="flex h-screen overflow-hidden bg-background text-foreground">
            <Sidenavbar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto bg-background">
                    <div className="mx-auto max-w-7xl px-6 py-5">
                        <div className="mb-6">
                            <AuthGuard>
                                <StudentRouteEnforcer isStudent={isStudent}>
                                    {children}
                                </StudentRouteEnforcer>
                            </AuthGuard>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
