import { BookText, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ContestGuidelinesProps {
    rules?: string | null;
}

export function ContestGuidelines({ rules }: ContestGuidelinesProps) {
    return (
        <Card className="border-border/60 shadow-sm rounded-2xl overflow-hidden bg-card h-full">
            <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                    <BookText className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm font-bold uppercase tracking-wider">
                        Guidelines
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
                {rules ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {rules}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center space-y-3 bg-muted/20 rounded-xl border border-dashed">
                        <AlertCircle className="h-8 w-8 text-muted-foreground/40" />
                        <div className="space-y-1">
                            <p className="text-sm font-semibold text-foreground/80">
                                No rules provided
                            </p>
                            <p className="text-xs text-muted-foreground max-w-[200px]">
                                Standard competition guidelines apply for this contest.
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
