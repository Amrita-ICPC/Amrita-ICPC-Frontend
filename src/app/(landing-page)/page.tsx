import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { Code2, Trophy, Users, FileCode2 } from "lucide-react";

export default async function LandingPage() {
    const session = await auth();
    if (session?.user) {
        redirect("/dashboard");
    }

    return (
        <main className="relative flex min-h-screen flex-col overflow-hidden bg-sidebar text-sidebar-foreground">
            {/* Background */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute left-1/2 top-[-10rem] h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-sidebar-primary/15 blur-[130px]" />
                <div className="absolute bottom-[-10rem] right-[-5rem] h-[400px] w-[400px] rounded-full bg-sidebar-primary/10 blur-[120px]" />
            </div>

            {/* Header */}
            <header className="relative flex items-center justify-between border-b border-sidebar-border px-8 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-primary/20 text-sidebar-primary">
                        <Code2 className="h-4 w-4" />
                    </div>
                    <div>
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
                            Amrita
                        </span>
                        <span className="ml-2 text-sm font-bold text-sidebar-foreground">
                            ICPC Platform
                        </span>
                    </div>
                </div>
                <Link
                    href="/auth/login"
                    className="rounded-lg bg-sidebar-primary px-4 py-2 text-sm font-semibold text-sidebar-primary-foreground transition-opacity hover:opacity-90"
                >
                    Sign in
                </Link>
            </header>

            {/* Hero */}
            <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sidebar-border bg-sidebar-accent/40 px-4 py-1.5 text-xs font-medium text-sidebar-foreground/60">
                    <span className="h-1.5 w-1.5 rounded-full bg-sidebar-primary" />
                    Competitive Programming Infrastructure
                </div>

                <h1 className="mt-4 text-5xl font-extrabold tracking-tight text-sidebar-foreground sm:text-6xl">
                    Amrita{" "}
                    <span className="text-sidebar-primary">ICPC</span>
                </h1>

                <p className="mt-5 max-w-lg text-base text-sidebar-foreground/60">
                    Manage contests, questions, teams, and submissions in one place.
                    Built for instructors, students, and contest managers.
                </p>

                <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                    <Link
                        href="/auth/login"
                        className="rounded-lg bg-sidebar-primary px-6 py-3 text-sm font-semibold text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/20 transition-opacity hover:opacity-90"
                    >
                        Enter Platform
                    </Link>
                    <Link
                        href="/auth/login"
                        className="rounded-lg border border-sidebar-border px-6 py-3 text-sm font-semibold text-sidebar-foreground/70 transition-colors hover:border-sidebar-foreground/40 hover:text-sidebar-foreground"
                    >
                        Learn More
                    </Link>
                </div>

                {/* Feature pills */}
                <div className="mt-16 flex flex-wrap items-center justify-center gap-3">
                    {[
                        { icon: Trophy, label: "Live Contests" },
                        { icon: FileCode2, label: "Question Banks" },
                        { icon: Users, label: "Team Management" },
                        { icon: Code2, label: "Multi-language Execution" },
                    ].map(({ icon: Icon, label }) => (
                        <div
                            key={label}
                            className="flex items-center gap-2 rounded-lg border border-sidebar-border bg-sidebar-accent/30 px-4 py-2 text-xs font-medium text-sidebar-foreground/60"
                        >
                            <Icon className="h-3.5 w-3.5 text-sidebar-primary" />
                            {label}
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
