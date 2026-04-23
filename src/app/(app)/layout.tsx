import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import Sidenavbar from "@/components/global/sidenavbar";
import { AppShell } from "@/components/global/app-shell";
import { UserType } from "@/lib/auth/utils";
import AuthGuard from "@/components/global/auth-guard";
import AccessDenied from "@/components/global/access-denied";
import { logger } from "@/lib/logger";

export default async function AppLayout({
    children,
    student,
    instructor,
    manager,
    admin,
}: {
    children: React.ReactNode;
    student: React.ReactNode;
    instructor: React.ReactNode;
    manager: React.ReactNode;
    admin: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/login");
    }

    const userRoleCandidates = [
        ...(session.user.groups || []),
        ...((session.user.roles || []).filter((r) => !r.includes(":")) ?? []),
    ];

    const hasRole = (role: UserType) =>
        userRoleCandidates.some((r) => r.toLowerCase() === role.toLowerCase());

    const hasAnyRole =
        hasRole(UserType.ADMIN) ||
        hasRole(UserType.MANAGER) ||
        hasRole(UserType.INSTRUCTOR) ||
        hasRole(UserType.STUDENT);

    if (!hasAnyRole) {
        logger.warn(
            `User ${session.user.email} (ID: ${session.user.id}) has no recognized roles. Groups found: ${(session.user.groups || []).join(", ")}`,
        );
    }

    return (
        <AppShell sidebar={<Sidenavbar />}>
            <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                <div className="flex flex-col min-h-full">
                    {/* Main page content */}
                    {children}

                    {/* Role-specific parallel route slot */}
                    <div className="flex-1">
                        {hasRole(UserType.ADMIN) ? (
                            <AuthGuard requiredGroups={[UserType.ADMIN]}>{admin}</AuthGuard>
                        ) : hasRole(UserType.MANAGER) ? (
                            <AuthGuard requiredGroups={[UserType.MANAGER]}>{manager}</AuthGuard>
                        ) : hasRole(UserType.INSTRUCTOR) ? (
                            <AuthGuard requiredGroups={[UserType.INSTRUCTOR]}>
                                {instructor}
                            </AuthGuard>
                        ) : hasRole(UserType.STUDENT) ? (
                            <AuthGuard requiredGroups={[UserType.STUDENT]}>{student}</AuthGuard>
                        ) : (
                            <AccessDenied />
                        )}
                    </div>
                </div>
            </main>
        </AppShell>
    );
}
