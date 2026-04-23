import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileQuestion, UploadCloud } from "lucide-react";

export function ContestQuestionsPage() {
    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Manage Questions</CardTitle>
                    <CardDescription>
                        Add, edit, or remove questions for this contest. You can also import
                        questions from a file.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed rounded-xl bg-muted/20">
                        <FileQuestion className="h-12 w-12 text-muted-foreground/40 mb-4" />
                        <h3 className="text-lg font-semibold text-foreground/80">
                            No Questions Added
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-6">
                            Get started by creating a new question or importing a set of problems.
                        </p>
                        <div className="flex gap-4">
                            <Button variant="outline">
                                <UploadCloud className="h-4 w-4 mr-2" />
                                Import Questions
                            </Button>
                            <Button>Create Question</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
