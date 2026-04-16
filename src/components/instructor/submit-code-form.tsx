"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSubmitCode, useSubmissionLanguages } from "@/query/use-submissions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const submitCodeSchema = z.object({
    code: z.string().min(1, "Code is required"),
    language: z.string().min(1, "Please select a language"),
});

type SubmitCodeFormData = z.infer<typeof submitCodeSchema>;

interface SubmitCodeFormProps {
    contestId: string;
    questionId: string;
    onSuccess?: () => void;
}

export function SubmitCodeForm({ contestId, questionId, onSuccess }: SubmitCodeFormProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const { data: languages, isLoading: isLoadingLanguages } = useSubmissionLanguages();
    const { mutate: submitCode, isPending } = useSubmitCode(contestId, questionId);

    const form = useForm<SubmitCodeFormData>({
        resolver: zodResolver(submitCodeSchema),
        defaultValues: {
            code: "",
            language: "",
        },
    });

    const onSubmit = (data: SubmitCodeFormData) => {
        submitCode(
            {
                code: data.code,
                language: data.language,
            },
            {
                onSuccess: () => {
                    form.reset();
                    setIsExpanded(false);
                    onSuccess?.();
                },
            },
        );
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Submit Solution</CardTitle>
                <CardDescription>Write and submit your solution code</CardDescription>
            </CardHeader>
            <CardContent>
                {!isExpanded ? (
                    <Button onClick={() => setIsExpanded(true)} className="w-full">
                        Write Solution
                    </Button>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="language"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Language</FormLabel>
                                        <FormControl>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                disabled={isLoadingLanguages}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select language..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {languages?.map((lang) => (
                                                        <SelectItem
                                                            key={lang.language}
                                                            value={lang.language}
                                                        >
                                                            {lang.language}
                                                            {lang.version
                                                                ? ` (${lang.version})`
                                                                : ""}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Code</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Write your code here..."
                                                className="font-mono resize-none"
                                                rows={15}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex gap-4">
                                <Button type="submit" disabled={isPending} className="gap-2">
                                    {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {isPending ? "Submitting..." : "Submit"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setIsExpanded(false);
                                        form.reset();
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </Form>
                )}
            </CardContent>
        </Card>
    );
}
