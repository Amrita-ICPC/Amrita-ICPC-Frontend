import { Trophy, Users } from "lucide-react";

import { auth } from "@/lib/auth/auth";

export default async function StudentDashboardPage() {
    const session = await auth();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">
                    Welcome back{session?.user?.name ? `, ${session.user.name.split(" ")[0]}` : ""}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Amrita ICPC Platform — Student Dashboard
                </p>
            </div>

            {/* Quick nav cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                    {
                        icon: Trophy,
                        label: "Available Contests",
                        desc: "Browse and register for upcoming programming contests",
                        href: "/student/contest",
                        color: "text-indigo-500",
                        bg: "bg-indigo-500/10",
                    },
                    {
                        icon: Users,
                        label: "My Teams",
                        desc: "View and manage your contest teams",
                        href: "/student/teams",
                        color: "text-orange-500",
                        bg: "bg-orange-500/10",
                    },
                ].map(({ icon: Icon, label, desc, href, color, bg }) => (
                    <a
                        key={href}
                        href={href}
                        className="group flex items-start gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-accent"
                    >
                        <div
                            className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${bg}`}
                        >
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
        </div>
    );
}
