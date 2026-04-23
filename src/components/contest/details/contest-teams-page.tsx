import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Users2 } from "lucide-react";

export function ContestTeamsPage() {
    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Manage Teams</CardTitle>
                    <CardDescription>
                        View, approve, and manage all teams participating in this contest.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed rounded-xl bg-muted/20">
                        <Users2 className="h-12 w-12 text-muted-foreground/40 mb-4" />
                        <h3 className="text-lg font-semibold text-foreground/80">No Teams Found</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-6">
                            There are no teams registered for this contest yet. Participants can
                            create or join teams once registration opens.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
