import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-8 w-[200px]" />
            <Skeleton className="h-[320px] w-full rounded-lg" />
        </div>
    );
}
