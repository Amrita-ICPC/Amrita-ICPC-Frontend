import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ContestSkeleton() {
    return (
        <Card className="flex h-full flex-col overflow-hidden">
            <Skeleton className="aspect-video w-full rounded-none" />
            <CardHeader className="p-4 pb-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="mt-2 h-4 w-full" />
                <Skeleton className="mt-1 h-4 w-2/3" />
            </CardHeader>

            <CardContent className="flex-1 p-4 pt-2">
                <div className="mt-2 flex flex-col gap-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                </div>
            </CardContent>

            <CardFooter className="p-4 pt-0">
                <Skeleton className="h-9 w-full" />
            </CardFooter>
        </Card>
    );
}
