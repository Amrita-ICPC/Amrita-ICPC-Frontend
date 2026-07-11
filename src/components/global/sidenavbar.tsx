import { auth } from "@/lib/auth/auth";
import { getDefaultRoute, UserType } from "@/lib/auth/utils";

import { NavLinks } from "./nav-links";

export default async function Sidenavbar() {
    const session = await auth();
    const user = session?.user;
    const allRoles = [...(user?.roles ?? []), ...(user?.groups ?? [])];
    const isAdmin = allRoles.some((r) => r.toLowerCase() === UserType.ADMIN.toLowerCase());
    const isStudent = getDefaultRoute(user) === "/student/dashboard";

    return (
        <aside className="group relative flex h-screen w-16 hover:w-48 transition-all duration-300 ease-in-out shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground overflow-hidden z-50">
            {/* Logo */}
            <div className="flex h-14 shrink-0 items-center justify-center border-b border-transparent group-hover:border-sidebar-border opacity-0 group-hover:opacity-100 transition-all duration-300">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src="/logo.png"
                    alt="ICPC Logo"
                    className="h-20 w-auto max-w-none object-cover"
                />
            </div>

            {/* Nav */}
            <div className="w-full">
                <NavLinks isAdmin={isAdmin} isStudent={isStudent} />
            </div>
        </aside>
    );
}
