"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    ChevronRight,
    ChevronLeft,
    Plus,
    Trash2,
    Loader2,
    Code,
    FileText,
    Database,
    Languages,
    CheckCircle2,
    Hash,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

import {
    useCreateQuestionApiV1QuestionsPost,
    useGetPlatformLanguagesApiV1QuestionsLanguagesPlatformGet,
} from "@/api/generated/questions/questions";
import { useAddQuestionsToBankApiV1BanksBankIdQuestionsPost } from "@/api/generated/bank-questions/bank-questions";
import { CreateQuestionApiV1QuestionsPostBody } from "@/api/generated/zod/questions/questions";
import { TagSelector } from "@/components/shared/tags/tag-selector";
import * as zod from "zod";

type QuestionFormValues = zod.infer<typeof CreateQuestionApiV1QuestionsPostBody>;

const steps = [
    { id: "metadata", title: "Metadata", icon: FileText },
    { id: "testcases", title: "Test Cases", icon: Database },
    { id: "templates", title: "Code Templates", icon: Code },
];

interface QuestionWizardProps {
    bankId?: string;
    onSuccess?: (questionId: string) => void;
}

export function QuestionWizard({ bankId, onSuccess }: QuestionWizardProps) {
    const [currentStep, setCurrentStep] = useState(0);

    const { mutateAsync: addQuestionsToBank } =
        useAddQuestionsToBankApiV1BanksBankIdQuestionsPost();

    const { mutate: createQuestion, isPending } = useCreateQuestionApiV1QuestionsPost({
        mutation: {
            onSuccess: async (response) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const questionId = (response as any)?.data?.id;

                if (bankId && questionId) {
                    try {
                        await addQuestionsToBank({
                            bankId,
                            data: { question_ids: [questionId] },
                        });
                        toast.success("Question created and added to bank!");
                    } catch {
                        toast.error("Question created but failed to link to bank");
                    }
                } else {
                    toast.success("Question created successfully!");
                }

                form.reset();
                setCurrentStep(0);
                if (onSuccess && questionId) onSuccess(questionId);
            },
            onError: (error: unknown) => {
                toast.error(
                    (error as { response?: { data?: { message?: string } } })?.response?.data
                        ?.message || "Failed to create question",
                );
            },
        },
    });

    const { data: languagesData } = useGetPlatformLanguagesApiV1QuestionsLanguagesPlatformGet();
    // Assuming platform languages have id and slug/name
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const languages = (languagesData as any)?.data || [];

    const form = useForm<QuestionFormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(CreateQuestionApiV1QuestionsPostBody) as any,
        defaultValues: {
            question_text: "",
            difficulty: "MEDIUM" as const,
            time_limit_ms: 1000,
            memory_limit_mb: 256,
            allowed_languages: [],
            tag_ids: [],
            testcases: [{ input: "", output: "", is_hidden: false, weight: 1 }],
            templates: [],
        },
    });

    const {
        fields: testcaseFields,
        append: appendTestcase,
        remove: removeTestcase,
    } = useFieldArray({
        control: form.control,
        name: "testcases",
    });

    const { append: appendTemplate, remove: removeTemplate } = useFieldArray({
        control: form.control,
        name: "templates",
    });

    const nextStep = async () => {
        const fieldsToValidate =
            currentStep === 0
                ? [
                      "question_text",
                      "difficulty",
                      "time_limit_ms",
                      "memory_limit_mb",
                      "allowed_languages",
                  ]
                : currentStep === 1
                  ? ["testcases"]
                  : [];

        const isValid = await form.trigger(fieldsToValidate as (keyof QuestionFormValues)[]);
        if (isValid) setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    };

    const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

    const onSubmit = (data: QuestionFormValues) => {
        createQuestion({ data });
    };

    const selectedLangIds = form.watch("allowed_languages");
    const activeTemplates = form.watch("templates") || [];

    return (
        <div className="max-w-5xl mx-auto">
            {/* Stepper */}
            <div className="mb-12">
                <div className="flex items-center justify-between relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -translate-y-1/2 -z-10" />
                    {steps.map((step, idx) => {
                        const Icon = step.icon;
                        const isCompleted = currentStep > idx;
                        const isActive = currentStep === idx;

                        return (
                            <div
                                key={step.id}
                                className="flex flex-col items-center gap-2 bg-[#0a0c10] px-4"
                            >
                                <div
                                    className={`h-12 w-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                                        isCompleted
                                            ? "bg-primary border-primary text-white"
                                            : isActive
                                              ? "border-primary text-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]"
                                              : "border-white/10 text-white/20"
                                    }`}
                                >
                                    {isCompleted ? (
                                        <CheckCircle2 className="h-6 w-6" />
                                    ) : (
                                        <Icon className="h-5 w-5" />
                                    )}
                                </div>
                                <span
                                    className={`text-xs font-bold uppercase tracking-widest ${
                                        isActive ? "text-primary" : "text-white/20"
                                    }`}
                                >
                                    {step.title}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {/* STEP 1: METADATA */}
                            {currentStep === 0 && (
                                <Card className="border-white/10 bg-[#0f1117] text-white">
                                    <CardContent className="p-8 space-y-8">
                                        <FormField
                                            control={form.control}
                                            name="question_text"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-lg">
                                                        Problem Statement
                                                    </FormLabel>
                                                    <FormDescription className="text-white/40">
                                                        Markdown is supported for the description.
                                                    </FormDescription>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Describe the problem, constraints, and examples..."
                                                            className="min-h-[300px] border-white/10 bg-white/5 focus-visible:ring-primary/50 text-base"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                            <FormField
                                                control={form.control}
                                                name="difficulty"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Difficulty</FormLabel>
                                                        <Select
                                                            onValueChange={field.onChange}
                                                            defaultValue={field.value}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger className="border-white/10 bg-white/5">
                                                                    <SelectValue placeholder="Select difficulty" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent className="border-white/10 bg-[#161922] text-white">
                                                                <SelectItem value="EASY">
                                                                    Easy
                                                                </SelectItem>
                                                                <SelectItem value="MEDIUM">
                                                                    Medium
                                                                </SelectItem>
                                                                <SelectItem value="HARD">
                                                                    Hard
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="time_limit_ms"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Time Limit (ms)</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                className="border-white/10 bg-white/5"
                                                                {...field}
                                                                onChange={(e) =>
                                                                    field.onChange(
                                                                        parseInt(e.target.value),
                                                                    )
                                                                }
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="memory_limit_mb"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Memory Limit (MB)</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                className="border-white/10 bg-white/5"
                                                                {...field}
                                                                onChange={(e) =>
                                                                    field.onChange(
                                                                        parseInt(e.target.value),
                                                                    )
                                                                }
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name="tag_ids"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-2">
                                                        <Hash className="h-4 w-4" /> Categorization
                                                        Tags
                                                    </FormLabel>
                                                    <FormControl>
                                                        <TagSelector
                                                            selectedTagIds={field.value || []}
                                                            onChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="allowed_languages"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-2">
                                                        <Languages className="h-4 w-4" /> Allowed
                                                        Languages
                                                    </FormLabel>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                        {languages.map((lang: any) => (
                                                            <div
                                                                key={lang.id}
                                                                className={`cursor-pointer rounded-lg border p-3 text-center transition-all ${
                                                                    field.value.includes(lang.id)
                                                                        ? "border-primary bg-primary/10 text-primary"
                                                                        : "border-white/10 bg-white/5 text-white/40 hover:border-white/20"
                                                                }`}
                                                                onClick={() => {
                                                                    const current =
                                                                        field.value || [];
                                                                    if (current.includes(lang.id)) {
                                                                        field.onChange(
                                                                            current.filter(
                                                                                (id) =>
                                                                                    id !== lang.id,
                                                                            ),
                                                                        );
                                                                    } else {
                                                                        field.onChange([
                                                                            ...current,
                                                                            lang.id,
                                                                        ]);
                                                                    }
                                                                }}
                                                            >
                                                                <span className="text-sm font-bold">
                                                                    {lang.slug?.toUpperCase() ||
                                                                        lang.id}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>
                                </Card>
                            )}

                            {/* STEP 2: TEST CASES */}
                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-2xl font-bold flex items-center gap-2">
                                            <Database className="h-6 w-6 text-primary" /> Test Cases
                                        </h2>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="gap-2 border-white/10 hover:bg-white/5"
                                            onClick={() =>
                                                appendTestcase({
                                                    input: "",
                                                    output: "",
                                                    is_hidden: false,
                                                    weight: 1,
                                                })
                                            }
                                        >
                                            <Plus className="h-4 w-4" /> Add Test Case
                                        </Button>
                                    </div>

                                    <div className="space-y-4">
                                        {testcaseFields.map((field, index) => (
                                            <Card
                                                key={field.id}
                                                className="border-white/10 bg-[#0f1117] overflow-hidden group"
                                            >
                                                <div className="bg-white/5 px-6 py-3 flex items-center justify-between border-b border-white/10">
                                                    <span className="text-xs font-bold text-white/40 uppercase tracking-widest">
                                                        Case #{index + 1}
                                                    </span>
                                                    <div className="flex items-center gap-4">
                                                        <FormField
                                                            control={form.control}
                                                            name={`testcases.${index}.is_hidden`}
                                                            render={({ field }) => (
                                                                <FormItem className="flex items-center gap-2 space-y-0">
                                                                    <FormLabel className="text-[10px] uppercase font-bold text-white/40">
                                                                        Hidden
                                                                    </FormLabel>
                                                                    <FormControl>
                                                                        <Switch
                                                                            checked={field.value}
                                                                            onCheckedChange={
                                                                                field.onChange
                                                                            }
                                                                            className="scale-75 data-[state=checked]:bg-primary"
                                                                        />
                                                                    </FormControl>
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-white/20 hover:text-red-400 hover:bg-red-500/10"
                                                            onClick={() => removeTestcase(index)}
                                                            disabled={testcaseFields.length === 1}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <FormField
                                                        control={form.control}
                                                        name={`testcases.${index}.input`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-xs font-bold text-white/60">
                                                                    Input
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Textarea
                                                                        className="font-mono text-sm border-white/10 bg-black/20 focus-visible:ring-primary/30"
                                                                        {...field}
                                                                    />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name={`testcases.${index}.output`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-xs font-bold text-white/60">
                                                                    Expected Output
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Textarea
                                                                        className="font-mono text-sm border-white/10 bg-black/20 focus-visible:ring-primary/30"
                                                                        {...field}
                                                                    />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: TEMPLATES */}
                            {currentStep === 2 && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-2xl font-bold flex items-center gap-2">
                                            <Code className="h-6 w-6 text-primary" /> Code Templates
                                        </h2>
                                    </div>

                                    {selectedLangIds.length === 0 ? (
                                        <Card className="border-dashed border-white/10 bg-white/5">
                                            <CardContent className="p-12 text-center text-white/40">
                                                No languages selected. Go back to Step 1 to select
                                                allowed languages.
                                            </CardContent>
                                        </Card>
                                    ) : (
                                        <Tabs
                                            defaultValue={String(selectedLangIds[0])}
                                            className="w-full"
                                        >
                                            <TabsList className="bg-white/5 border border-white/10 p-1 mb-8 overflow-x-auto max-w-full justify-start">
                                                {selectedLangIds.map((langId) => {
                                                    const lang = languages.find(
                                                        (l: { id: number; slug?: string }) =>
                                                            l.id === langId,
                                                    );
                                                    const hasTemplate = activeTemplates.some(
                                                        (t: { language_id: number }) =>
                                                            t.language_id === langId,
                                                    );
                                                    return (
                                                        <TabsTrigger
                                                            key={langId}
                                                            value={String(langId)}
                                                            className="data-[state=active]:bg-primary data-[state=active]:text-white gap-2"
                                                        >
                                                            {lang?.slug?.toUpperCase() || langId}
                                                            {hasTemplate && (
                                                                <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                                                            )}
                                                        </TabsTrigger>
                                                    );
                                                })}
                                            </TabsList>

                                            {selectedLangIds.map((langId) => {
                                                const existingIdx = activeTemplates.findIndex(
                                                    (t: { language_id: number }) =>
                                                        t.language_id === langId,
                                                );
                                                const hasTemplate = existingIdx !== -1;

                                                return (
                                                    <TabsContent
                                                        key={langId}
                                                        value={String(langId)}
                                                        className="mt-0"
                                                    >
                                                        {!hasTemplate ? (
                                                            <div className="flex flex-col items-center justify-center p-12 border border-dashed border-white/10 rounded-xl bg-white/5 text-center">
                                                                <Code className="h-12 w-12 text-white/10 mb-4" />
                                                                <p className="text-white/60 mb-6">
                                                                    No template configured for this
                                                                    language.
                                                                </p>
                                                                <Button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        appendTemplate({
                                                                            language_id: langId,
                                                                            starter_code:
                                                                                "// Your code here",
                                                                            driver_code: "",
                                                                            solution_code: "",
                                                                        })
                                                                    }
                                                                    className="gap-2"
                                                                >
                                                                    <Plus className="h-4 w-4" /> Add
                                                                    Template
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <Card className="border-white/10 bg-[#0f1117]">
                                                                <CardContent className="p-0">
                                                                    <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
                                                                        <span className="text-xs font-bold text-white/40 uppercase tracking-widest">
                                                                            Template Configuration
                                                                        </span>
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="text-red-400 hover:bg-red-500/10"
                                                                            onClick={() =>
                                                                                removeTemplate(
                                                                                    existingIdx,
                                                                                )
                                                                            }
                                                                        >
                                                                            Remove
                                                                        </Button>
                                                                    </div>
                                                                    <div className="p-6 space-y-6">
                                                                        <FormField
                                                                            control={form.control}
                                                                            name={`templates.${existingIdx}.starter_code`}
                                                                            render={({ field }) => (
                                                                                <FormItem>
                                                                                    <FormLabel className="text-xs font-bold text-white/60">
                                                                                        Starter Code
                                                                                        (Initial
                                                                                        Editor
                                                                                        Content)
                                                                                    </FormLabel>
                                                                                    <FormControl>
                                                                                        <Textarea
                                                                                            className="font-mono text-sm border-white/10 bg-black/20 focus-visible:ring-primary/30 min-h-[200px]"
                                                                                            {...field}
                                                                                        />
                                                                                    </FormControl>
                                                                                </FormItem>
                                                                            )}
                                                                        />
                                                                        <FormField
                                                                            control={form.control}
                                                                            name={`templates.${existingIdx}.driver_code`}
                                                                            render={({ field }) => (
                                                                                <FormItem>
                                                                                    <FormLabel className="text-xs font-bold text-white/60">
                                                                                        Driver Code
                                                                                        (Hidden
                                                                                        Wrapper -
                                                                                        Optional)
                                                                                    </FormLabel>
                                                                                    <FormControl>
                                                                                        <Textarea
                                                                                            className="font-mono text-sm border-white/10 bg-black/20 focus-visible:ring-primary/30 min-h-[150px]"
                                                                                            {...field}
                                                                                            value={
                                                                                                field.value ||
                                                                                                ""
                                                                                            }
                                                                                        />
                                                                                    </FormControl>
                                                                                </FormItem>
                                                                            )}
                                                                        />
                                                                        <FormField
                                                                            control={form.control}
                                                                            name={`templates.${existingIdx}.solution_code`}
                                                                            render={({ field }) => (
                                                                                <FormItem>
                                                                                    <FormLabel className="text-xs font-bold text-white/60">
                                                                                        Solution
                                                                                        Code
                                                                                        (Reference -
                                                                                        Optional)
                                                                                    </FormLabel>
                                                                                    <FormControl>
                                                                                        <Textarea
                                                                                            className="font-mono text-sm border-white/10 bg-black/20 focus-visible:ring-primary/30 min-h-[150px]"
                                                                                            {...field}
                                                                                            value={
                                                                                                field.value ||
                                                                                                ""
                                                                                            }
                                                                                        />
                                                                                    </FormControl>
                                                                                </FormItem>
                                                                            )}
                                                                        />
                                                                    </div>
                                                                </CardContent>
                                                            </Card>
                                                        )}
                                                    </TabsContent>
                                                );
                                            })}
                                        </Tabs>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="flex items-center justify-between pt-8 border-t border-white/5">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={prevStep}
                            disabled={currentStep === 0}
                            className="gap-2 text-white/40 hover:text-white"
                        >
                            <ChevronLeft className="h-4 w-4" /> Previous
                        </Button>

                        {currentStep < steps.length - 1 ? (
                            <Button
                                type="button"
                                onClick={nextStep}
                                className="gap-2 min-w-[120px]"
                            >
                                Next <ChevronRight className="h-4 w-4" />
                            </Button>
                        ) : (
                            <Button
                                type="submit"
                                disabled={isPending}
                                className="gap-2 min-w-[140px] shadow-[0_0_20px_rgba(var(--primary),0.2)]"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" /> Creating...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="h-4 w-4" /> Create Question
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </form>
            </Form>
        </div>
    );
}
