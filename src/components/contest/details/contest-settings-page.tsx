import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function ContestSettingsPage() {
    return (
        <div className="space-y-8">
            <Card className="border-destructive/50 bg-destructive/5">
                <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    <CardDescription className="text-destructive/80">
                        This action is irreversible. Please be certain before proceeding.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-background/50 rounded-lg border border-destructive/20">
                        <div>
                            <h4 className="font-bold text-foreground">Delete Contest</h4>
                            <p className="text-xs text-muted-foreground">
                                This will permanently delete the contest and all associated data.
                            </p>
                        </div>
                        <Button variant="destructive" className="mt-4 sm:mt-0 shrink-0">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete this Contest
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
