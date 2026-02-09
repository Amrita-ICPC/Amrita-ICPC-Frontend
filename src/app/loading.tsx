import { Space_Grotesk } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    variable: "--font-space-grotesk",
});

export default function Loading() {
    return (
        <main
            className={`${spaceGrotesk.variable} relative min-h-screen overflow-hidden bg-[#0b0d12] text-white`}
        >
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-1/2 top-[-18rem] h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-[#38bdf8]/20 blur-[140px]" />
                <div className="absolute bottom-[-16rem] left-6 h-[420px] w-[420px] rounded-full bg-[#f97316]/15 blur-[140px]" />
            </div>
            <div className="relative flex min-h-screen items-center justify-center px-6 text-center">
                <div className="rounded-3xl border border-white/10 bg-white/5 px-10 py-8 text-sm uppercase tracking-[0.4em] text-white/60">
                    Loading
                </div>
            </div>
        </main>
    );
}
