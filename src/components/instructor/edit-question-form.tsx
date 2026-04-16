"use client";

import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { usePlatformLanguages, useUpdateQuestion, useQuestion } from "@/query/use-questions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Plus, ArrowLeft, Trash2 } from "lucide-react";
import { useState } from "react";

const testCaseSchema = z.object({
    input: z.string().min(0),
    output: z.string().min(0),
    is_hidden: z.boolean().default(false),
    weight: z.number().int().min(1).default(1),
    order: z.number().int().min(0).default(0),
});

const templateSchema = z.object({
    starter_code: z.string().default(""),
    driver_code: z.string().default(""),
    solution_code: z.string().default(""),
});

const editQuestionSchema = z.object({
    title: z.string().min(1, "Title required").max(255),
    statement: z.string().optional(),
    difficulty: z.enum(["easy", "medium", "hard"]).optional(),
    language: z.string().optional(),
    time_limit: z.number().int().min(1).optional(),
    memory_limit: z.number().int().min(1).optional(),
    allowed_languages: z.array(z.string()).optional(),
    tag_ids: z.array(z.string()).optional(),
    test_cases: z.array(testCaseSchema).optional(),
    templates: z.record(z.string(), templateSchema).optional(),
});

type EditQuestionFormData = z.infer<typeof editQuestionSchema>;

function DeleteConfirmDialog({
    onConfirm,
    onCancel,
}: {
    onConfirm: () => void;
    onCancel: () => void;
}) {
    return (
        <Dialog open onOpenChange={(open) => !open && onCancel()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Test Case?</DialogTitle>
                    <DialogDescription>This cannot be undone.</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={onConfirm}>
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function EditQuestionForm({ questionId }: { questionId: string }) {
    const router = useRouter();
    const { data: languages = [], isLoading: languagesLoading } = usePlatformLanguages();
    const { data: question, isLoading: questionLoading } = useQuestion(questionId);
    const updateQuestion = useUpdateQuestion();
    const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm<EditQuestionFormData>({
        resolver: zodResolver(editQuestionSchema),
        defaultValues: {
            allowed_languages: [],
            tag_ids: [],
            test_cases: [],
            templates: {},
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    const {
        fields: testCaseFields,
        append: appendTestCase,
        remove: removeTestCase,
    } = useFieldArray({
        control,
        name: "test_cases",
    });

    // Load question data into form
    useEffect(() => {
        if (question) {
            reset({
                title: question.title,
                statement: question.statement,
                difficulty: question.difficulty,
                language: question.language,
                time_limit: question.time_limit,
                memory_limit: question.memory_limit,
                allowed_languages: question.allowed_languages,
                tag_ids: question.tag_ids,
                test_cases: question.test_cases,
                templates: question.templates,
            });
        }
    }, [question, reset]);

    const onSubmit = async (data: EditQuestionFormData) => {
        updateQuestion.mutate(
            {
                id: questionId,
                payload: {
                    title: data.title,
                    statement: data.statement || undefined,
                    difficulty: data.difficulty,
                    language: data.language,
                    time_limit: data.time_limit ? Math.floor(data.time_limit) : undefined,
                    memory_limit: data.memory_limit ? Math.floor(data.memory_limit) : undefined,
                    allowed_languages: data.allowed_languages?.length
                        ? data.allowed_languages
                        : undefined,
                    tag_ids: data.tag_ids?.length ? data.tag_ids : undefined,
                    test_cases: data.test_cases?.length ? data.test_cases : undefined,
                    templates: Object.keys(data.templates || {}).length
                        ? data.templates
                        : undefined,
                },
            },
            {
                onSuccess: () => {
                    router.back();
                },
            },
        );
    };

    if (questionLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-full" />
                <Card>
                    <Skeleton className="h-96 w-full" />
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Button>
            </div>

            <Card className="p-6">
                <h1 className="text-2xl font-bold mb-6">Edit Question</h1>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <Tabs defaultValue="basic" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="basic">Basic Info</TabsTrigger>
                            <TabsTrigger value="test-cases">Test Cases</TabsTrigger>
                            <TabsTrigger value="templates">Templates</TabsTrigger>
                        </TabsList>

                        {/* TAB 1: BASIC INFO */}
                        <TabsContent value="basic" className="space-y-6 pt-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Title <span className="text-red-600">*</span>
                                </label>
                                <Input
                                    placeholder="e.g., Sum of Array Elements"
                                    {...register("title")}
                                    className={errors.title ? "border-red-500" : ""}
                                />
                                {errors.title && (
                                    <p className="text-sm text-red-500 mt-1">
                                        {errors.title.message as string}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Problem Statement
                                </label>
                                <Textarea
                                    placeholder="Describe the problem, constraints, input/output format..."
                                    rows={8}
                                    {...register("statement")}
                                    className="font-mono"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Difficulty
                                    </label>
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
                                    <label className="block text-sm font-medium mb-2">
                                        Language
                                    </label>
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
                                                        {languages.map((lang) => (
                                                            <SelectItem
                                                                key={lang.id}
                                                                value={lang.id}
                                                            >
                                                                {lang.name}
                                                                {lang.version &&
                                                                    ` (${lang.version})`}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    )}
                                </div>
                            </div>

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
                                        {...register("time_limit", { valueAsNumber: true })}
                                        className={errors.time_limit ? "border-red-500" : ""}
                                    />
                                    {errors.time_limit && (
                                        <p className="text-sm text-red-500 mt-1">
                                            {errors.time_limit.message as string}
                                        </p>
                                    )}
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
                                        {...register("memory_limit", { valueAsNumber: true })}
                                        className={errors.memory_limit ? "border-red-500" : ""}
                                    />
                                    {errors.memory_limit && (
                                        <p className="text-sm text-red-500 mt-1">
                                            {errors.memory_limit.message as string}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Allowed Languages
                                </label>
                                {languagesLoading ? (
                                    <Skeleton className="h-24 w-full" />
                                ) : (
                                    <Controller
                                        name="allowed_languages"
                                        control={control}
                                        render={({ field }) => (
                                            <div className="space-y-2 p-3 border rounded-md bg-gray-50">
                                                {languages.map((lang) => (
                                                    <div
                                                        key={lang.id}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <Checkbox
                                                            id={`lang-${lang.id}`}
                                                            checked={(field.value || []).includes(
                                                                lang.id,
                                                            )}
                                                            onCheckedChange={(checked) => {
                                                                const current = field.value || [];
                                                                if (checked) {
                                                                    field.onChange([
                                                                        ...current,
                                                                        lang.id,
                                                                    ]);
                                                                } else {
                                                                    field.onChange(
                                                                        current.filter(
                                                                            (x: string) =>
                                                                                x !== lang.id,
                                                                        ),
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                        <label
                                                            htmlFor={`lang-${lang.id}`}
                                                            className="text-sm font-medium cursor-pointer"
                                                        >
                                                            {lang.name}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    />
                                )}
                            </div>
                        </TabsContent>

                        {/* TAB 2: TEST CASES */}
                        <TabsContent value="test-cases" className="space-y-4 pt-4">
                            <div className="rounded border">
                                {testCaseFields.length === 0 ? (
                                    <div className="p-6 text-center text-gray-500">
                                        <p>No test cases</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="border-b bg-gray-50">
                                                <tr>
                                                    <th className="p-3 text-left font-medium">
                                                        Input
                                                    </th>
                                                    <th className="p-3 text-left font-medium">
                                                        Output
                                                    </th>
                                                    <th className="p-3 text-left font-medium">
                                                        Hidden
                                                    </th>
                                                    <th className="p-3 text-left font-medium">
                                                        Weight
                                                    </th>
                                                    <th className="p-3 text-center font-medium">
                                                        Action
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {testCaseFields.map((field, index) => (
                                                    <tr
                                                        key={field.id}
                                                        className="border-b hover:bg-gray-50"
                                                    >
                                                        <td className="p-3">
                                                            <Input
                                                                placeholder="Input"
                                                                {...register(
                                                                    `test_cases.${index}.input`,
                                                                )}
                                                                className="font-mono text-xs"
                                                            />
                                                        </td>
                                                        <td className="p-3">
                                                            <Input
                                                                placeholder="Output"
                                                                {...register(
                                                                    `test_cases.${index}.output`,
                                                                )}
                                                                className="font-mono text-xs"
                                                            />
                                                        </td>
                                                        <td className="p-3">
                                                            <Controller
                                                                name={`test_cases.${index}.is_hidden`}
                                                                control={control}
                                                                render={({ field }) => (
                                                                    <Checkbox
                                                                        checked={
                                                                            field.value || false
                                                                        }
                                                                        onCheckedChange={
                                                                            field.onChange
                                                                        }
                                                                    />
                                                                )}
                                                            />
                                                        </td>
                                                        <td className="p-3">
                                                            <Input
                                                                type="number"
                                                                placeholder="1"
                                                                min="1"
                                                                {...register(
                                                                    `test_cases.${index}.weight`,
                                                                    { valueAsNumber: true },
                                                                )}
                                                                className="font-mono text-xs"
                                                            />
                                                        </td>
                                                        <td className="p-3 text-center">
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                onClick={() =>
                                                                    setDeleteConfirmIndex(index)
                                                                }
                                                            >
                                                                <Trash2 className="w-4 h-4 text-red-500" />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    appendTestCase({
                                        input: "",
                                        output: "",
                                        is_hidden: false,
                                        weight: 1,
                                        order: testCaseFields.length,
                                    })
                                }
                                className="w-full gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Add Test Case
                            </Button>

                            {deleteConfirmIndex !== null && (
                                <DeleteConfirmDialog
                                    onConfirm={() => {
                                        removeTestCase(deleteConfirmIndex);
                                        setDeleteConfirmIndex(null);
                                    }}
                                    onCancel={() => setDeleteConfirmIndex(null)}
                                />
                            )}
                        </TabsContent>

                        {/* TAB 3: TEMPLATES */}
                        <TabsContent value="templates" className="space-y-4 pt-4">
                            {languagesLoading ? (
                                <Skeleton className="h-64 w-full" />
                            ) : (
                                <div className="space-y-4">
                                    {languages.map((lang) => (
                                        <div
                                            key={lang.id}
                                            className="space-y-3 p-4 border rounded-lg"
                                        >
                                            <h4 className="font-medium">{lang.name}</h4>
                                            <div>
                                                <label className="text-xs font-medium">
                                                    Starter Code
                                                </label>
                                                <Controller
                                                    name={`templates.${lang.id}.starter_code`}
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Textarea
                                                            placeholder="Starter code..."
                                                            rows={4}
                                                            value={field.value || ""}
                                                            onChange={field.onChange}
                                                            className="font-mono text-xs"
                                                        />
                                                    )}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium">
                                                    Driver Code
                                                </label>
                                                <Controller
                                                    name={`templates.${lang.id}.driver_code`}
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Textarea
                                                            placeholder="Driver code..."
                                                            rows={4}
                                                            value={field.value || ""}
                                                            onChange={field.onChange}
                                                            className="font-mono text-xs"
                                                        />
                                                    )}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium">
                                                    Solution Code
                                                </label>
                                                <Controller
                                                    name={`templates.${lang.id}.solution_code`}
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Textarea
                                                            placeholder="Solution code..."
                                                            rows={4}
                                                            value={field.value || ""}
                                                            onChange={field.onChange}
                                                            className="font-mono text-xs"
                                                        />
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>

                    <div className="flex gap-3 pt-4 border-t">
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
                            disabled={updateQuestion.isPending}
                        >
                            {updateQuestion.isPending ? "Updating..." : "Update Question"}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
