"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Code2 } from "lucide-react";

function LoginContent() {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
    const [isRedirecting, setIsRedirecting] = useState(true);

    useEffect(() => {
        let active = true;
        const start = async () => {
            try {
                await signIn("keycloak", { callbackUrl });
            } finally {
                if (active) setIsRedirecting(false);
            }
        };
        start();
        return () => {
            active = false;
        };
    }, [callbackUrl]);

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-sidebar px-6">
            {/* Background glow */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sidebar-primary/20 blur-[120px]" />
                <div className="absolute bottom-0 left-0 h-80 w-80 -translate-x-1/2 translate-y-1/2 rounded-full bg-sidebar-primary/10 blur-[100px]" />
            </div>

            <div className="relative w-full max-w-sm">
                {/* Card */}
                <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-8 shadow-2xl backdrop-blur">
                    {/* Logo */}
                    <div className="mb-8 flex flex-col items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sidebar-primary/20 text-sidebar-primary">
                            <Code2 className="h-6 w-6" />
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-sidebar-foreground/40">
                                Amrita University
                            </p>
                            <h1 className="text-xl font-bold text-sidebar-foreground">
                                ICPC Platform
                            </h1>
                        </div>
                    </div>

                    <div className="mb-6 text-center">
                        <p className="text-sm text-sidebar-foreground/60">
                            {isRedirecting
                                ? "Redirecting to Keycloak..."
                                : "Click below to continue"}
                        </p>
                    </div>

                    <button
                        onClick={() => signIn("keycloak", { callbackUrl })}
                        disabled={isRedirecting}
                        className="w-full rounded-lg bg-sidebar-primary px-4 py-2.5 text-sm font-semibold text-sidebar-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isRedirecting ? "Redirecting…" : "Continue to Keycloak"}
                    </button>
                </div>

                <p className="mt-4 text-center text-xs text-sidebar-foreground/30">
                    Secure login via Keycloak SSO
                </p>
            </div>
        </main>
    );
}

export default function LoginClient() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-sidebar" />}>
            <LoginContent />
        </Suspense>
    );
}
