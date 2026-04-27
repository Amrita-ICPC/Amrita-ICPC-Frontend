import Link from "next/link";
import { auth, signOut } from "@/lib/auth/auth";
import {
    Database,
    LayoutDashboard,
    Languages,
    LogOut,
    Settings,
    Trophy,
    Users,
    UsersRound,
} from "lucide-react";
import AuthGuard from "@/components/global/auth-guard";
import { UserType } from "@/lib/auth/utils";

function getInitials(name?: string | null, email?: string | null) {
    const source = name || email || "User";
    const parts = source.split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export default async function Sidenavbar() {
    const session = await auth();
    const user = session?.user;

    async function handleSignOut() {
        "use server";
        await signOut({ redirectTo: "/auth/login" });
    }

    return (
        <aside className="flex h-screen w-72 flex-col border-r border-white/10 bg-[#0b0d12] px-6 py-8 text-white">
            <div className="mb-10 flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#5eead4] to-[#38bdf8] p-[2px]">
                    <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#0b0d12] text-sm font-semibold">
                        IC
                    </div>
                </div>
                <div>
                    <div className="text-sm uppercase tracking-[0.35em] text-white/60">Amrita</div>
                    <div className="text-lg font-semibold">ICPC</div>
                </div>
            </div>

            <nav className="flex-1 space-y-2 text-sm">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-3 rounded-2xl border border-white/10 px-4 py-3 text-white/80 transition hover:border-white/40 hover:text-white"
                >
                    <LayoutDashboard className="h-4 w-4" />
                    Home
                </Link>
                <Link
                    href="/contest"
                    className="flex items-center gap-3 rounded-2xl border border-white/5 px-4 py-3 text-white/70 transition hover:border-white/30 hover:text-white"
                >
                    <Trophy className="h-4 w-4" />
                    Contest
                </Link>
                <Link
                    href="/teams"
                    className="flex items-center gap-3 rounded-2xl border border-white/5 px-4 py-3 text-white/70 transition hover:border-white/30 hover:text-white"
                >
                    <Users className="h-4 w-4" />
                    Teams
                </Link>

                <AuthGuard requiredGroups={[UserType.ADMIN]} fallbackComponent={null}>
                    <Link
                        href="/audiences"
                        className="flex items-center gap-3 rounded-2xl border border-white/5 px-4 py-3 text-white/70 transition hover:border-white/30 hover:text-white"
                    >
                        <UsersRound className="h-4 w-4" />
                        Manage Users
                    </Link>
                    <Link
                        href="/languages"
                        className="flex items-center gap-3 rounded-2xl border border-white/5 px-4 py-3 text-white/70 transition hover:border-white/30 hover:text-white"
                    >
                        <Languages className="h-4 w-4" />
                        Manage Languages
                    </Link>
                </AuthGuard>

                <Link
                    href="/banks"
                    className="flex items-center gap-3 rounded-2xl border border-white/5 px-4 py-3 text-white/70 transition hover:border-white/30 hover:text-white"
                >
                    <Database className="h-4 w-4" />
                    Question Banks
                </Link>
                <Link
                    href="/questions"
                    className="flex items-center gap-3 rounded-2xl border border-white/5 px-4 py-3 text-white/70 transition hover:border-white/30 hover:text-white"
                >
                    <Database className="h-4 w-4" />
                    Question Editor
                </Link>
                <Link
                    href="/settings"
                    className="flex items-center gap-3 rounded-2xl border border-white/5 px-4 py-3 text-white/70 transition hover:border-white/30 hover:text-white"
                >
                    <Settings className="h-4 w-4" />
                    Settings
                </Link>
            </nav>

            <div className="mt-6 border-t border-white/10 pt-6">
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xs font-semibold">
                        {getInitials(user?.name, user?.email)}
                    </div>
                    <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">
                            {user?.name || "ICPC User"}
                        </div>
                        <div className="truncate text-xs text-white/60">
                            {user?.email || "Signed in"}
                        </div>
                    </div>
                </div>
                <form action={handleSignOut} className="mt-3">
                    <button
                        type="submit"
                        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/80 transition hover:border-white/40 hover:text-white"
                    >
                        <LogOut className="h-4 w-4" />
                        Logout
                    </button>
                </form>
            </div>
        </aside>
    );
}
