import { StudentDashboardClient } from "@/components/student/dashboard/student-dashboard-client";
import { auth } from "@/lib/auth/auth";

export default async function StudentDashboardPage() {
    const session = await auth();
    const firstName = session?.user?.name?.split(" ")[0] ?? "";

    return <StudentDashboardClient firstName={firstName} />;
}
