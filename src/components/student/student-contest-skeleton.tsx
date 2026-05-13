export function StudentContestSkeleton() {
    return (
        <div className="flex w-full flex-col rounded-2xl bg-white dark:bg-slate-900/50 overflow-hidden border border-slate-200/60 dark:border-white/10 sm:flex-row h-auto sm:h-64 animate-pulse">
            <div className="flex flex-1 flex-col p-6 space-y-6">
                <div className="space-y-3">
                    <div className="h-6 w-1/3 rounded bg-slate-100 dark:bg-slate-800" />
                    <div className="h-4 w-2/3 rounded bg-slate-50 dark:bg-slate-800/50" />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800" />
                        <div className="space-y-2">
                            <div className="h-2 w-10 rounded bg-slate-50 dark:bg-slate-800/50" />
                            <div className="h-3 w-20 rounded bg-slate-100 dark:bg-slate-800" />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800" />
                        <div className="space-y-2">
                            <div className="h-2 w-10 rounded bg-slate-50 dark:bg-slate-800/50" />
                            <div className="h-3 w-20 rounded bg-slate-100 dark:bg-slate-800" />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800" />
                        <div className="space-y-2">
                            <div className="h-2 w-10 rounded bg-slate-50 dark:bg-slate-800/50" />
                            <div className="h-3 w-20 rounded bg-slate-100 dark:bg-slate-800" />
                        </div>
                    </div>
                </div>
                <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4 dark:border-white/5">
                    <div className="h-4 w-1/4 rounded bg-slate-50 dark:bg-slate-800/50" />
                    <div className="h-4 w-20 rounded bg-slate-100 dark:bg-slate-800" />
                </div>
            </div>
            <div className="h-48 w-full sm:h-full sm:w-72 p-4">
                <div className="h-full w-full rounded-xl bg-slate-100 dark:bg-slate-800" />
            </div>
        </div>
    );
}
