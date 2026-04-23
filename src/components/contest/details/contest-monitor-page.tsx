import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Activity } from "lucide-react";

export function ContestMonitorPage() {
    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Live Contest Monitor</CardTitle>
                    <CardDescription>
                        Observe real-time submissions, clarification requests, and judging activity.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed rounded-xl bg-muted/20">
                        <Activity className="h-12 w-12 text-muted-foreground/40 mb-4 animate-pulse" />
                        <h3 className="text-lg font-semibold text-foreground/80">
                            Awaiting Contest Start
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-sm mt-1">
                            The live monitor will become available once the contest begins.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
