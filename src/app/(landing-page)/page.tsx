import Link from "next/link";
import { Space_Grotesk } from "next/font/google";
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";

const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    variable: "--font-space-grotesk",
});

export default async function LandingPage() {
    const session = await auth();
    if (session?.user) {
        redirect("/dashboard");
    }

    return (
        <main
            className={`${spaceGrotesk.variable} relative min-h-screen overflow-hidden bg-[#0b0d12] text-white`}
        >
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-1/2 top-[-20rem] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#38bdf8]/30 blur-[140px]" />
                <div className="absolute bottom-[-16rem] left-10 h-[420px] w-[420px] rounded-full bg-[#f97316]/25 blur-[140px]" />
                <div className="absolute right-12 top-24 h-[320px] w-[320px] rounded-full bg-[#5eead4]/25 blur-[120px]" />
                <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
                <div className="absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5" />
            </div>

            <div className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
                <div className="mb-6 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs uppercase tracking-[0.4em] text-white/70">
                    Amrita ICPC
                </div>
                <h1 className="text-5xl font-semibold tracking-[0.2em] sm:text-6xl">ICPC</h1>
                <p className="mt-4 max-w-xl text-sm text-white/60 sm:text-base">
                    Competition infrastructure, simplified for teams and juries.
                </p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                    <Link
                        href="/auth/login"
                        className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#0b0d12] transition hover:-translate-y-0.5 hover:bg-white/90"
                    >
                        Sign in
                    </Link>
                    <Link
                        href="/auth/login"
                        className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white/80 transition hover:border-white hover:text-white"
                    >
                        Enter platform
                    </Link>
                </div>
            </div>
        </main>
    );
}
