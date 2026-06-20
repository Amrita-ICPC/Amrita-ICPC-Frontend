import type { LucideIcon } from "lucide-react";
import { Lock, Trophy } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

interface ResultsGateProps {
    icon?: LucideIcon;
    title: string;
    description: string;
}

export function ResultsGate({ icon: Icon = Trophy, title, description }: ResultsGateProps) {
    return (
        <Card className="border-dashed border-border/70 bg-muted/10">
            <CardContent className="flex min-h-[280px] flex-col items-center justify-center gap-3 p-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Icon className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                    <p className="font-semibold text-foreground">{title}</p>
                    <p className="max-w-md text-sm text-muted-foreground">{description}</p>
                </div>
            </CardContent>
        </Card>
    );
}

export function ResultsNotPublishedGate() {
    return (
        <ResultsGate
            icon={Lock}
            title="Results haven't been published yet"
            description="Once the instructor publishes results for this contest, your team's score and submissions will appear here."
        />
    );
}

export function SubmissionsHiddenGate() {
    return (
        <ResultsGate
            icon={Lock}
            title="Submission details aren't available"
            description="The instructor hasn't enabled team submission visibility for this contest."
        />
    );
}

export function LeaderboardHiddenGate() {
    return (
        <ResultsGate
            icon={Lock}
            title="Leaderboard isn't available"
            description="The instructor hasn't enabled the leaderboard for this contest."
        />
    );
}
