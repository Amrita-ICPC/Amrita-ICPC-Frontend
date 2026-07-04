import { redirect } from "next/navigation";

import { InstructorDashboardClient } from "@/components/instructor/dashboard/instructor-dashboard-client";
import { auth } from "@/lib/auth/auth";
import { belongsToGroup, getDefaultRoute, UserType } from "@/lib/auth/utils";

/** @instructor @admin Staff dashboard entry point. */
export default async function DashboardPage() {
    const session = await auth();

    if (session?.user && getDefaultRoute(session.user) === "/student/dashboard") {
        redirect("/student/dashboard");
    }

    const firstName = session?.user?.name?.split(" ")[0] ?? "";
    const isAdmin = belongsToGroup(session?.user, [UserType.ADMIN]);

    return (
        <InstructorDashboardClient
            firstName={firstName}
            audience={isAdmin ? "admin" : "instructor"}
        />
    );
}
