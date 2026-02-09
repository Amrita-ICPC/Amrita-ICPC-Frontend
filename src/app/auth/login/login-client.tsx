"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Space_Grotesk } from "next/font/google";
import { Suspense, useEffect, useState } from "react";

const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    variable: "--font-space-grotesk",
});

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
        <main
            className={`${spaceGrotesk.variable} relative min-h-screen overflow-hidden bg-[#0b0d12] text-white`}
        >
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-1/2 top-[-18rem] h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-[#38bdf8]/25 blur-[140px]" />
                <div className="absolute bottom-[-16rem] left-6 h-[420px] w-[420px] rounded-full bg-[#f97316]/20 blur-[140px]" />
                <div className="absolute right-12 top-24 h-[320px] w-[320px] rounded-full bg-[#5eead4]/20 blur-[120px]" />
            </div>

            <div className="relative flex min-h-screen items-center justify-center px-6 text-center">
                <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur">
                    <div className="mb-6 text-xs uppercase tracking-[0.4em] text-white/60">
                        Amrita ICPC
                    </div>
                    <h1 className="text-3xl font-semibold">Sign in</h1>
                    <p className="mt-3 text-sm text-white/60">
                        Redirecting you to the Keycloak login page.
                    </p>
                    <button
                        onClick={() => signIn("keycloak", { callbackUrl })}
                        disabled={isRedirecting}
                        className="mt-8 w-full rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#0b0d12] transition hover:-translate-y-0.5 hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isRedirecting ? "Redirecting..." : "Continue to Keycloak"}
                    </button>
                </div>
            </div>
        </main>
    );
}

export default function LoginClient() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0b0d12] text-white" />}>
            <LoginContent />
        </Suspense>
    );
}
