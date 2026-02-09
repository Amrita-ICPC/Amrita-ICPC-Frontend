import Link from "next/link";
import { Space_Grotesk } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    variable: "--font-space-grotesk",
});

export default function NotFound() {
    return (
        <main
            className={`${spaceGrotesk.variable} relative min-h-screen overflow-hidden bg-[#0b0d12] text-white`}
        >
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-1/2 top-[-18rem] h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-[#38bdf8]/25 blur-[140px]" />
                <div className="absolute bottom-[-16rem] left-6 h-[420px] w-[420px] rounded-full bg-[#f97316]/20 blur-[140px]" />
            </div>
            <div className="relative flex min-h-screen items-center justify-center px-6 text-center">
                <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur">
                    <div className="mb-4 text-xs uppercase tracking-[0.4em] text-white/60">404</div>
                    <h1 className="text-3xl font-semibold">Page not found</h1>
                    <p className="mt-3 text-sm text-white/60">
                        The page you are looking for does not exist.
                    </p>
                    <Link
                        href="/"
                        className="mt-8 inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#0b0d12] transition hover:-translate-y-0.5 hover:bg-white/90"
                    >
                        Back to home
                    </Link>
                </div>
            </div>
        </main>
    );
}
