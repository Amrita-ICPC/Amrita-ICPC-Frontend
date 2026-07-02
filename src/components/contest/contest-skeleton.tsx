export function ContestSkeleton() {
    return (
        <div className="flex min-h-[306px] animate-pulse flex-col overflow-hidden rounded-[20px] border border-border bg-white shadow-lg shadow-black/10 dark:border-white/10 dark:bg-[#081326] dark:shadow-black/30">
            <div className="h-[162px] w-full bg-primary/25 px-7 py-6">
                <div className="flex justify-between">
                    <div className="h-7 w-24 rounded-full bg-white/10" />
                    <div className="h-7 w-20 rounded-full bg-white/10" />
                </div>
                <div className="mt-7 h-5 w-3/4 rounded bg-white/15" />
                <div className="mt-3 h-3 w-24 rounded bg-white/10" />
            </div>
            <div className="h-[60px] border-y border-border px-7 py-5 dark:border-white/10 dark:bg-white/[0.02]">
                <div className="h-4 w-full rounded bg-slate-200 dark:bg-white/10" />
            </div>
            <div className="flex flex-1 items-center justify-between px-7 py-4">
                <div className="h-3 w-20 rounded bg-slate-200 dark:bg-white/10" />
                <div className="h-9 w-20 rounded-lg bg-primary/35" />
            </div>
        </div>
    );
}
