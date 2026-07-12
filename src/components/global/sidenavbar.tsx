import { auth } from "@/lib/auth/auth";
import { getDefaultRoute, UserType } from "@/lib/auth/utils";

import { SidenavbarClient } from "./sidenavbar-client";

export default async function Sidenavbar() {
    const session = await auth();
    const user = session?.user;
    const allRoles = [...(user?.roles ?? []), ...(user?.groups ?? [])];
    const isAdmin = allRoles.some((r) => r.toLowerCase() === UserType.ADMIN.toLowerCase());
    const isStudent = getDefaultRoute(user) === "/student/dashboard";

    return (
        <SidenavbarClient
            isAdmin={isAdmin}
            isStudent={isStudent}
            user={{ name: user?.name, email: user?.email }}
        />
    );
}
