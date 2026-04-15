import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

interface DashboardLayoutProps {
    admin: React.ReactNode;
    instructor: React.ReactNode;
    student: React.ReactNode;
}

export default async function DashboardLayout({
    admin,
    instructor,
    student,
}: DashboardLayoutProps) {
    const session = await auth();

    if (!session?.user) {
        logger.warn("Unauthenticated access to dashboard, redirecting to login");
        redirect("/auth/login");
    }

    logger.info({ userId: session.user.id, roles: session.user.roles }, "Rendering dashboard");

    const userRoles = session.user.roles || [];
    const isAdmin = userRoles.includes("admin");
    const isInstructor = userRoles.includes("instructor");
    const isStudent = userRoles.includes("student");

    // Determine which slot to render based on highest privilege role
    const renderSlot = () => {
        if (isAdmin) {
            logger.debug("Rendering admin dashboard");
            return admin;
        }
        if (isInstructor) {
            logger.debug("Rendering instructor dashboard");
            return instructor;
        }
        if (isStudent) {
            logger.debug("Rendering student dashboard");
            return student;
        }
        // Fallback to student if no role matches
        logger.warn({ roles: userRoles }, "No recognized role found, defaulting to student");
        return student;
    };

    return <>{renderSlot()}</>;
}
