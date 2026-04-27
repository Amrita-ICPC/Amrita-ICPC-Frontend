import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import Sidenavbar from "@/components/global/sidenavbar";
import { Header } from "@/components/global/header";
import { UserType } from "@/lib/auth/utils";
import AuthGuard from "@/components/global/auth-guard";
import AccessDenied from "@/components/global/access-denied";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

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

    return (
        <div className="flex h-screen overflow-hidden bg-background text-foreground">
            <Sidenavbar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto bg-background">
                    <div className="mx-auto max-w-7xl px-6 py-5">
                        <div className="mb-6">{children}</div>
                        <div>
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
            </div>
        </div>
    );
}
