import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function AudienceSkeleton() {
    return (
        <Card className="flex flex-col overflow-hidden">
            <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="mt-2 h-3 w-full" />
                    </div>
                    <Skeleton className="h-4 w-16 rounded-full" />
                </div>
            </CardHeader>

            <CardContent className="p-4 pt-2">
                <div className="grid grid-cols-2 gap-2">
                    <Skeleton className="h-7 w-full" />
                    <Skeleton className="h-7 w-full" />
                    <Skeleton className="h-7 w-full" />
                    <Skeleton className="h-7 w-full" />
                </div>
            </CardContent>

            <CardFooter className="p-4 pt-0">
                <Skeleton className="h-8 w-full" />
            </CardFooter>
        </Card>
    );
}
