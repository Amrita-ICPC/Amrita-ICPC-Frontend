import { ReactNode } from "react";
import { auth } from "@/auth";
import AuthGuard from "@/components/auth/AuthGuard";
import AccessDenied from "@/components/auth/access-denied";

interface DashboardLayoutProps {
    children: ReactNode;
    student: ReactNode;
    coach: ReactNode;
    manager: ReactNode;
    admin: ReactNode;
}

export default async function DashboardLayout({
    children,
    student,
    coach,
    manager,
    admin,
}: DashboardLayoutProps) {
    const session = await auth();
    const roles = session?.user?.roles || [];

    /**
     * Role-Based Content Hub
     * Conditionally renders the slot (@admin, @student, etc.) matching the user's role.
     */
    return (
        <AuthGuard>
            <div className="flex flex-col min-h-screen bg-background">
                <header className="border-b bg-card h-16 flex items-center px-6">
                    <h1 className="text-xl font-bold text-primary">Amrita ICPC Platform</h1>
                </header>
                <main className="flex-grow p-4 md:p-8">
                    {children}
                    <div className="w-full">
                        {roles.includes("ADMIN") && admin}
                        {roles.includes("COACH") && coach}
                        {roles.includes("MANAGER") && manager}
                        {roles.includes("STUDENT") && student}

                        {roles.length === 0 && <AccessDenied />}
                    </div>
                </main>
            </div>
        </AuthGuard>
    );
}
