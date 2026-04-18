import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import Sidenavbar from "@/components/global/sidenavbar";
import { UserType } from "@/lib/auth/utils";
import AuthGuard from "@/components/global/auth-guard";

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
    const hasRole = (role: UserType) =>
        userRoles.some((r) => r.toLowerCase() === role.toLowerCase());

    return (
        <div className="flex h-screen overflow-hidden bg-[#0b0d12] text-white">
            <Sidenavbar />
            <main className="flex-1 overflow-y-auto px-8 py-8 flex flex-col">
                {/* Main page content (e.g., Dashboard) */}
                <div className="mb-8">{children}</div>

                {/* Role-specific parallel route slot */}
                <div className="flex-1">
                    {hasRole(UserType.ADMIN) ? (
                        <AuthGuard requiredRoles={[UserType.ADMIN]}>{admin}</AuthGuard>
                    ) : hasRole(UserType.MANAGER) ? (
                        <AuthGuard requiredRoles={[UserType.MANAGER]}>{manager}</AuthGuard>
                    ) : hasRole(UserType.INSTRUCTOR) ? (
                        <AuthGuard requiredRoles={[UserType.INSTRUCTOR]}>{instructor}</AuthGuard>
                    ) : hasRole(UserType.STUDENT) ? (
                        <AuthGuard requiredRoles={[UserType.STUDENT]}>{student}</AuthGuard>
                    ) : null}
                </div>
            </main>
        </div>
    );
}
