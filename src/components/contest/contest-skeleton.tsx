export function ContestSkeleton() {
    return (
        <div className="flex h-[280px] flex-col rounded-xl bg-[#0c1a2e] overflow-hidden shadow-lg shadow-black/30 animate-pulse">
            <div className="h-[130px] w-full bg-[#0f2040]" />
            <div className="flex flex-1 flex-col justify-between px-4 py-3">
                <div className="space-y-2">
                    <div className="h-4 w-3/4 rounded bg-[#0f2040]" />
                    <div className="h-3 w-full rounded bg-[#0f2040]/70" />
                    <div className="h-3 w-2/3 rounded bg-[#0f2040]/70" />
                </div>
                <div className="flex items-center justify-between">
                    <div className="h-3 w-32 rounded bg-[#0f2040]/70" />
                    <div className="h-3 w-10 rounded bg-[#0f2040]/70" />
                </div>
            </div>
        </div>
    );
}
