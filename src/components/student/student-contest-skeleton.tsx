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

export function StudentContestDetailSkeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
            {/* Left Column (Hero & Content Skeletons) */}
            <div className="lg:col-span-2 space-y-6">
                {/* Hero Card Skeleton */}
                <div className="overflow-hidden border border-slate-200/60 dark:border-white/10 rounded-2xl bg-white dark:bg-slate-900/50 shadow-sm">
                    {/* Banner Image Area */}
                    <div className="h-64 w-full bg-slate-100 dark:bg-slate-800" />

                    {/* Body Area */}
                    <div className="p-6 space-y-6">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-1/3 rounded-lg bg-slate-100 dark:bg-slate-800" />
                                <div className="h-6 w-24 rounded-full bg-slate-100/50 dark:bg-slate-800/50" />
                            </div>
                            <div className="h-4 w-3/4 rounded bg-slate-50 dark:bg-slate-800/30" />
                        </div>

                        {/* Metadata Rows */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                            {[...Array(4)].map((_, i) => (
                                <div
                                    key={i}
                                    className="h-16 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5"
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Timeline Card Skeleton */}
                <div className="border border-slate-200/60 dark:border-white/10 rounded-2xl bg-white dark:bg-slate-900/50 p-6 space-y-6 shadow-sm">
                    <div className="h-5 w-48 rounded bg-slate-100 dark:bg-slate-800" />
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative pt-2">
                        {[...Array(5)].map((_, i) => (
                            <div
                                key={i}
                                className="flex md:flex-col items-center gap-3 md:text-center"
                            >
                                <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800" />
                                <div className="flex flex-col md:items-center gap-1.5 flex-1">
                                    <div className="h-3 w-20 rounded bg-slate-100 dark:bg-slate-800" />
                                    <div className="h-2 w-24 rounded bg-slate-50 dark:bg-slate-800/50" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Rules Card Skeleton */}
                <div className="border border-slate-200/60 dark:border-white/10 rounded-2xl bg-white dark:bg-slate-900/50 p-6 space-y-6 shadow-sm">
                    <div className="h-5 w-32 rounded bg-slate-100 dark:bg-slate-800" />
                    <div className="space-y-3 pt-2">
                        <div className="h-4 w-full rounded bg-slate-50 dark:bg-slate-800/30" />
                        <div className="h-4 w-11/12 rounded bg-slate-50 dark:bg-slate-800/30" />
                        <div className="h-4 w-4/5 rounded bg-slate-50 dark:bg-slate-800/30" />
                        <div className="h-4 w-9/12 rounded bg-slate-50 dark:bg-slate-800/30" />
                    </div>
                </div>
            </div>

            {/* Right Column (Sidebar Skeletons) */}
            <div className="space-y-6">
                {/* Contest Control Skeleton */}
                <div className="border border-slate-200/60 dark:border-white/10 rounded-2xl bg-white dark:bg-slate-900/50 p-6 space-y-6 shadow-sm">
                    <div className="space-y-3">
                        <div className="h-4 w-28 rounded bg-slate-50 dark:bg-slate-800/50" />
                        <div className="h-10 w-full rounded-xl bg-slate-100 dark:bg-slate-800" />
                    </div>
                    <div className="h-10 w-full rounded-xl bg-slate-100 dark:bg-slate-800" />
                </div>

                {/* Overall Registrations Skeleton */}
                <div className="border border-slate-200/60 dark:border-white/10 rounded-2xl bg-white dark:bg-slate-900/50 p-6 space-y-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="h-4 w-36 rounded bg-slate-100 dark:bg-slate-800" />
                        <div className="h-5 w-16 rounded-full bg-slate-100/50 dark:bg-slate-800/50" />
                    </div>
                    <div className="space-y-3">
                        <div className="h-6 w-24 rounded bg-slate-100 dark:bg-slate-800" />
                        <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800" />
                    </div>
                </div>

                {/* Team Status Skeleton */}
                <div className="border border-slate-200/60 dark:border-white/10 rounded-2xl bg-white dark:bg-slate-900/50 p-6 space-y-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="h-4 w-24 rounded bg-slate-100 dark:bg-slate-800" />
                        <div className="h-5 w-16 rounded-full bg-slate-100/50 dark:bg-slate-800/50" />
                    </div>
                    <div className="space-y-3 pt-2">
                        <div className="h-3 w-16 rounded bg-slate-50 dark:bg-slate-800/50" />
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between p-2.5 border border-slate-100 dark:border-white/5 rounded-xl bg-slate-50/20 dark:bg-slate-900/10"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="h-7 w-7 rounded-full bg-slate-100 dark:bg-slate-800" />
                                    <div className="h-3.5 w-24 rounded bg-slate-100 dark:bg-slate-800" />
                                </div>
                                <div className="h-4 w-12 rounded bg-slate-100 dark:bg-slate-800" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
