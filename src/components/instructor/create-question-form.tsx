"use client";

/**
 * Create Question Form
 * Form for creating a new question with full details
 */

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { usePlatformLanguages, useCreateQuestion } from "@/query/use-questions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, ArrowLeft } from "lucide-react";

const createQuestionSchema = z.object({
    title: z
        .string()
        .min(1, "Title is required")
        .max(255, "Title must be less than 255 characters"),
    statement: z.string().optional(),
    difficulty: z.enum(["easy", "medium", "hard"]).optional(),
    language: z.string().optional(),
    time_limit: z.string().optional(),
    memory_limit: z.string().optional(),
});

type CreateQuestionFormData = z.infer<typeof createQuestionSchema>;

export function CreateQuestionForm() {
    const router = useRouter();
    const { data: languages, isLoading: languagesLoading } = usePlatformLanguages();
    const createQuestion = useCreateQuestion();

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<CreateQuestionFormData>({
        resolver: zodResolver(createQuestionSchema),
    });

    const onSubmit = async (data: CreateQuestionFormData) => {
        createQuestion.mutate(
            {
                title: data.title,
                statement: data.statement || undefined,
                difficulty: data.difficulty,
                language: data.language,
                time_limit: data.time_limit ? Number(data.time_limit) : undefined,
                memory_limit: data.memory_limit ? Number(data.memory_limit) : undefined,
            },
            {
                onSuccess: () => {
                    router.back();
                },
            },
        );
    };

    return (
        <div className="space-y-6">
            {/* Navigation */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Button>
            </div>

            {/* Form Card */}
            <Card className="p-6">
                <h1 className="text-2xl font-bold mb-6">Create New Question</h1>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Question Title <span className="text-red-600">*</span>
                        </label>
                        <Input
                            placeholder="e.g., Sum of Array"
                            {...register("title")}
                            className={errors.title ? "border-red-500" : ""}
                        />
                        {errors.title && (
                            <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
                        )}
                    </div>

                    {/* Problem Statement */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Problem Statement</label>
                        <Textarea
                            placeholder="Describe the problem here..."
                            rows={8}
                            {...register("statement")}
                            className="font-mono"
                        />
                    </div>

                    {/* Difficulty & Language Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Difficulty</label>
                            <Controller
                                name="difficulty"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        value={field.value || ""}
                                        onValueChange={field.onChange}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select difficulty" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="easy">Easy</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="hard">Hard</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Language</label>
                            {languagesLoading ? (
                                <Skeleton className="h-10 w-full" />
                            ) : (
                                <Controller
                                    name="language"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value || ""}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select language" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {languages?.map((lang) => (
                                                    <SelectItem key={lang.id} value={lang.id}>
                                                        {lang.name}
                                                        {lang.version && ` (${lang.version})`}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            )}
                        </div>
                    </div>

                    {/* Time & Memory Limits Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Time Limit (seconds)
                            </label>
                            <Input
                                type="number"
                                placeholder="e.g., 1"
                                min="1"
                                step="1"
                                {...register("time_limit")}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Memory Limit (MB)
                            </label>
                            <Input
                                type="number"
                                placeholder="e.g., 256"
                                min="1"
                                step="1"
                                {...register("memory_limit")}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 gap-2"
                            disabled={createQuestion.isPending}
                        >
                            <Plus className="w-4 h-4" />
                            {createQuestion.isPending ? "Creating..." : "Create Question"}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
