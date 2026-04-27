import { auth } from "@/lib/auth/auth";
import { UserType } from "@/lib/auth/utils";
import { NavLinks } from "./nav-links";
import { UserMenu } from "./user-menu";

export default async function Sidenavbar() {
    const session = await auth();
    const user = session?.user;
    const allRoles = [...(user?.roles ?? []), ...(user?.groups ?? [])];
    const isAdmin = allRoles.some((r) => r.toLowerCase() === UserType.ADMIN.toLowerCase());

    return (
        <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
            {/* Logo */}
            <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white/15 text-xs font-bold text-white">
                    IC
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-semibold leading-tight text-sidebar-foreground">
                        ICPC Platform
                    </p>
                    <p className="text-[10px] leading-tight text-sidebar-foreground/60">
                        Amrita University
                    </p>
                </div>
            </div>

            {/* Nav */}
            <NavLinks isAdmin={isAdmin} />

            {/* User */}
            <div className="border-t border-sidebar-border px-3 pb-4 pt-2">
                <UserMenu name={user?.name} email={user?.email} />
            </div>
        </aside>
    );
}
