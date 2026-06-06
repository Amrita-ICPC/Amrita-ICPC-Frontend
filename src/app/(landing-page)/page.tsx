import { Code2 } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { FeatureCards } from "@/components/landing/feature-cards";
import { auth } from "@/lib/auth/auth";
import { getDefaultRoute } from "@/lib/auth/utils";

export default async function LandingPage() {
    const session = await auth();
    if (session?.user) {
        redirect(getDefaultRoute(session.user));
    }

    return (
        <main className="relative flex min-h-screen flex-col overflow-hidden bg-sidebar text-sidebar-foreground">
            {/* Subtle Radial Gradients */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute left-1/4 top-1/4 h-[600px] w-[600px] rounded-full bg-sidebar-primary opacity-5 blur-[150px]" />
                <div className="absolute right-1/4 bottom-1/4 h-[500px] w-[500px] rounded-full bg-sidebar-primary opacity-4 blur-[140px]" />
            </div>

            {/* Subtle Dot Pattern */}
            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    backgroundImage:
                        "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
                    backgroundSize: "60px 60px",
                    opacity: 0.3,
                }}
            />

            {/* Header/Navbar */}
            <header className="relative z-10 flex items-center justify-between border-b border-sidebar-border px-8 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-primary/20 text-sidebar-primary">
                        <Code2 className="h-4 w-4" />
                    </div>
                    <div>
                        <span className="block text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
                            Amrita
                        </span>
                        <span className="text-sm font-bold text-sidebar-foreground">
                            ICPC Platform
                        </span>
                    </div>
                </div>
                <Link
                    href="/auth/login"
                    className="rounded-lg bg-sidebar-primary px-6 py-2 text-sm font-semibold text-sidebar-primary-foreground transition-all duration-300 hover:shadow-lg hover:shadow-sidebar-primary/30"
                >
                    Sign In
                </Link>
            </header>

            {/* Hero Section */}
            <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
                <div className="mx-auto w-full max-w-[900px]">
                    {/* Badge */}
                    <div className="mb-6 inline-flex items-center rounded-full border border-sidebar-border bg-sidebar-accent/40 px-4 py-2 text-xs font-medium text-sidebar-foreground/80">
                        Competitive Programming Infrastructure
                    </div>

                    {/* Heading */}
                    <h1
                        className="mt-4 text-center font-extrabold tracking-tight text-sidebar-foreground"
                        style={{
                            fontSize: "clamp(2rem, 6vw, 4.5rem)",
                            letterSpacing: "-0.04em",
                            lineHeight: 1.1,
                        }}
                    >
                        <span>Amrita </span>
                        <span className="text-sidebar-primary">ICPC</span>
                    </h1>

                    {/* Description */}
                    <p
                        className="mx-auto mt-5 max-w-[700px] text-center leading-relaxed text-sidebar-foreground/75"
                        style={{
                            fontSize: "1rem",
                        }}
                    >
                        Manage contests, questions, teams, and submissions in one place. Built for
                        instructors, students, and contest managers.
                    </p>

                    {/* CTA Buttons */}
                    <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-4">
                        <Link
                            href="/auth/login"
                            className="rounded-[14px] px-8 font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-sidebar-primary/30"
                            style={{
                                height: "48px",
                                display: "flex",
                                alignItems: "center",
                                background: "var(--sidebar-primary)",
                                color: "var(--sidebar-primary-foreground)",
                                fontSize: "0.95rem",
                            }}
                        >
                            Enter Platform
                        </Link>
                        <Link
                            href="/auth/login"
                            className="rounded-[14px] border border-sidebar-border px-8 font-semibold text-sidebar-foreground/70 transition-all duration-300 hover:border-sidebar-foreground/40 hover:text-sidebar-foreground"
                            style={{
                                height: "48px",
                                display: "flex",
                                alignItems: "center",
                                background: "transparent",
                                fontSize: "0.95rem",
                            }}
                        >
                            Learn More
                        </Link>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="relative z-10 w-full px-6 py-12 sm:px-8">
                <div className="mx-auto max-w-[1400px]">
                    <FeatureCards />
                </div>
            </div>

            {/* Footer Spacing */}
            <div className="relative z-10 h-6" />
        </main>
    );
}
