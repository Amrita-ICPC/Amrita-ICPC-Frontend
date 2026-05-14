export function StudentContestSkeleton() {
    return (
        <div className="flex w-full flex-col rounded-2xl bg-white dark:bg-slate-900/50 overflow-hidden border border-slate-200/60 dark:border-white/10 min-h-64 sm:h-72 animate-pulse">
            {/* Top Section */}
            <div className="flex flex-1 flex-col sm:flex-row overflow-hidden">
                {/* Content Section (Left) */}
                <div className="flex flex-1 flex-col p-6 space-y-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="h-7 w-2/3 rounded bg-slate-100 dark:bg-slate-800" />
                            <div className="h-5 w-20 rounded-full bg-slate-100/50 dark:bg-slate-800/50" />
                        </div>
                        <div className="h-4 w-full rounded bg-slate-50 dark:bg-slate-800/30" />
                        <div className="h-4 w-3/4 rounded bg-slate-50 dark:bg-slate-800/30" />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-8 items-center mt-6">
                        {/* Date Component Skeleton */}
                        <div className="h-16 w-32 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5" />

                        {/* Meta Details Skeletons */}
                        <div className="flex gap-12 flex-1">
                            <div className="space-y-2">
                                <div className="h-2 w-10 rounded bg-slate-50 dark:bg-slate-800/50" />
                                <div className="h-3 w-20 rounded bg-slate-100 dark:bg-slate-800" />
                            </div>
                            <div className="space-y-2">
                                <div className="h-2 w-12 rounded bg-slate-50 dark:bg-slate-800/50" />
                                <div className="h-3 w-16 rounded bg-slate-100 dark:bg-slate-800" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Image Section (Right) */}
                <div className="relative w-full shrink-0 sm:w-64 z-10">
                    <div className="m-4 h-[calc(100%-2rem)] rounded-xl bg-slate-100 dark:bg-slate-800" />
                </div>
            </div>

            {/* Full Width Footer */}
            <div className="mt-auto flex items-center justify-between border-t border-slate-100 px-6 py-4 dark:border-white/5 bg-slate-50/20 dark:bg-slate-900/20">
                <div className="h-4 w-1/3 rounded bg-slate-50 dark:bg-slate-800/50" />
                <div className="flex items-center gap-2">
                    <div className="h-4 w-24 rounded bg-slate-100 dark:bg-slate-800" />
                    <div className="h-5 w-5 rounded bg-slate-100 dark:bg-slate-800" />
                </div>
            </div>
        </div>
    );
}
