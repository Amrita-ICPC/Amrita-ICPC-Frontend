import { auth } from "@/lib/auth/auth";
import { Trophy, FileCode2, Users, ShieldCheck } from "lucide-react";

export default async function DashboardPage() {
    const session = await auth();
    const roles = session?.user?.roles ?? [];
    const groups = session?.user?.groups ?? [];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">
                    Welcome back{session?.user?.name ? `, ${session.user.name.split(" ")[0]}` : ""}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Amrita ICPC Platform — manage contests, questions, and teams.
                </p>
            </div>

            {/* Quick nav cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                    {
                        icon: Trophy,
                        label: "Contests",
                        desc: "View and manage programming contests",
                        href: "/contest",
                        color: "text-indigo-500",
                        bg: "bg-indigo-500/10",
                    },
                    {
                        icon: FileCode2,
                        label: "Question Banks",
                        desc: "Browse and edit question collections",
                        href: "/banks",
                        color: "text-emerald-500",
                        bg: "bg-emerald-500/10",
                    },
                    {
                        icon: Users,
                        label: "Teams",
                        desc: "Manage contest teams and approvals",
                        href: "/teams",
                        color: "text-orange-500",
                        bg: "bg-orange-500/10",
                    },
                ].map(({ icon: Icon, label, desc, href, color, bg }) => (
                    <a
                        key={href}
                        href={href}
                        className="group flex items-start gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-accent"
                    >
                        <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${bg}`}>
                            <Icon className={`h-5 w-5 ${color}`} />
                        </div>
                        <div>
                            <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                {label}
                            </p>
                            <p className="mt-0.5 text-sm text-muted-foreground">{desc}</p>
                        </div>
                    </a>
                ))}
            </div>

            {/* Session debug — dev only */}
            <details className="rounded-xl border border-border bg-card p-5">
                <summary className="flex cursor-pointer items-center gap-2 text-sm font-medium text-muted-foreground select-none">
                    <ShieldCheck className="h-4 w-4" />
                    Session claims (debug)
                </summary>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {[
                        { label: "Roles", value: roles },
                        { label: "Groups", value: groups },
                    ].map(({ label, value }) => (
                        <div key={label}>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                {label}
                            </p>
                            <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs text-foreground/80 font-mono">
                                {JSON.stringify(value, null, 2)}
                            </pre>
                        </div>
                    ))}
                </div>
            </details>
        </div>
    );
}
