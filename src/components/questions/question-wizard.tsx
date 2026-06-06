"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import {
    ArrowLeft,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Code,
    Database,
    FileText,
    Languages,
    Loader2,
    Plus,
    Trash2,
    Upload,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as zod from "zod";

import { useAddQuestionsToBankApiV1BanksBankIdQuestionsPost } from "@/api/generated/bank-questions/bank-questions";
import {
    useCreateQuestionApiV1QuestionsPost,
    useGetPlatformLanguagesApiV1QuestionsLanguagesPlatformGet,
} from "@/api/generated/questions/questions";
import { CreateQuestionApiV1QuestionsPostBody } from "@/api/generated/zod/questions/questions";
import { TagSelector } from "@/components/shared/tags/tag-selector";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

type QuestionFormValues = zod.infer<typeof CreateQuestionApiV1QuestionsPostBody>;

const STEPS = [
    { id: "details", label: "Details" },
    { id: "statement", label: "Statement" },
    { id: "judge_config", label: "Judge Configuration" },
];

const CONFIG_TABS = [
    { id: "starter_code", label: "Starter Code", icon: Code },
    { id: "reference_solution", label: "Reference Solution", icon: FileText },
    { id: "test_cases", label: "Test Cases", icon: Database },
    { id: "driver_code", label: "Driver Code", icon: FileText },
];

interface QuestionWizardProps {
    bankId?: string;
    onSuccess?: (questionId: string) => void;
}

export function QuestionWizard({ bankId, onSuccess }: QuestionWizardProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [activeConfigTab, setActiveConfigTab] = useState("test_cases");
    const [activeTestCase, setActiveTestCase] = useState(0);

    const { mutateAsync: addQuestionsToBank } =
        useAddQuestionsToBankApiV1BanksBankIdQuestionsPost();

    const { mutate: createQuestion, isPending } = useCreateQuestionApiV1QuestionsPost({
        mutation: {
            onSuccess: async (response) => {
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
    const languages = (languagesData as any)?.data?.languages || [];

    const form = useForm<QuestionFormValues>({
        resolver: zodResolver(CreateQuestionApiV1QuestionsPostBody) as any,
        defaultValues: {
            title: "",
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
                ? ["title", "difficulty", "time_limit_ms", "memory_limit_mb", "allowed_languages"]
                : currentStep === 1
                  ? ["question_text"]
                  : [];

        const isValid = await form.trigger(fieldsToValidate as (keyof QuestionFormValues)[]);
        if (isValid) setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    };

    const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

    const onSubmit = (data: QuestionFormValues) => {
        createQuestion({ data });
    };

    const selectedLangIds = form.watch("allowed_languages");
    const activeTemplates = form.watch("templates") || [];

    // Ensure templates exist for selected languages
    const handleLanguageChange = (langId: number, isChecked: boolean) => {
        const current = form.getValues("allowed_languages") || [];
        if (isChecked) {
            form.setValue("allowed_languages", [...current, langId]);
            // Automatically add an empty template for the new language
            if (!activeTemplates.some((t) => t.language_id === langId)) {
                appendTemplate({
                    language_id: langId,
                    starter_code: "// Your code here\n",
                    driver_code: "",
                    solution_code: "",
                });
            }
        } else {
            form.setValue(
                "allowed_languages",
                current.filter((id) => id !== langId),
            );
            const templateIndex = activeTemplates.findIndex((t) => t.language_id === langId);
            if (templateIndex !== -1) {
                removeTemplate(templateIndex);
            }
        }
    };

    const isStepCompleted = (stepIdx: number) => currentStep > stepIdx;

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col min-h-screen bg-background"
            >
                {/* 1. Top Header Bar */}
                <div className="sticky top-0 z-30 flex min-h-[72px] items-center justify-between border-b border-border/60 bg-background/80 px-6 py-3 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/dashboard"
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 hover:bg-muted transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                <span>Questions</span>
                                <ChevronRight className="h-3 w-3" />
                                <span className="font-medium text-foreground">Create Problem</span>
                            </div>
                            <h1 className="text-xl font-bold tracking-tight text-foreground leading-none">
                                Create Problem
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-xs text-emerald-500 font-medium flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Auto-saved just now
                        </span>
                        <Button
                            type="button"
                            variant="outline"
                            className="h-9 px-4 border-border/60"
                        >
                            Preview
                        </Button>
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="h-9 px-5 shadow-lg shadow-primary/20"
                        >
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Save Problem
                        </Button>
                    </div>
                </div>

                {/* 2. Main Horizontal Stepper */}
                <div className="flex items-center justify-center border-b border-border/60 bg-card/30 px-6 py-4">
                    <div className="flex items-center gap-2 max-w-3xl w-full">
                        {STEPS.map((step, idx) => {
                            const active = currentStep === idx;
                            const completed = isStepCompleted(idx);
                            return (
                                <div
                                    key={step.id}
                                    className="flex items-center flex-1 last:flex-none"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${completed ? "bg-emerald-500 text-white" : active ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.3)]" : "bg-muted text-muted-foreground border border-border/60"}`}
                                        >
                                            {completed ? (
                                                <CheckCircle2 className="h-4 w-4" />
                                            ) : (
                                                idx + 1
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span
                                                className={`text-sm font-bold ${active || completed ? "text-foreground" : "text-muted-foreground"}`}
                                            >
                                                {step.label}
                                            </span>
                                            <span className="text-[11px] text-muted-foreground font-medium">
                                                {completed
                                                    ? "Completed"
                                                    : active
                                                      ? "In Progress"
                                                      : "Pending"}
                                            </span>
                                        </div>
                                    </div>
                                    {idx < STEPS.length - 1 && (
                                        <div className="h-px flex-1 bg-border/60 mx-6" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 3. Main Content Area */}
                <div className="flex-1 overflow-hidden flex bg-background">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="flex-1 w-full h-full overflow-y-auto"
                        >
                            {/* STEP 0: DETAILS */}
                            {currentStep === 0 && (
                                <div className="max-w-4xl mx-auto p-8 space-y-8">
                                    <div className="space-y-1">
                                        <h2 className="text-2xl font-bold text-foreground">
                                            Problem Details
                                        </h2>
                                        <p className="text-sm text-muted-foreground">
                                            Define the core metadata and limitations for your
                                            problem.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <FormField
                                                control={form.control}
                                                name="title"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                                            Problem Title
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="e.g. Two Sum"
                                                                className="h-11 bg-card/50 border-border/60 focus:border-primary/50 text-foreground"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="difficulty"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                                            Difficulty
                                                        </FormLabel>
                                                        <Select
                                                            onValueChange={field.onChange}
                                                            defaultValue={field.value}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger className="h-11 bg-card/50 border-border/60 focus:border-primary/50 text-foreground">
                                                                    <SelectValue placeholder="Select difficulty" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
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
                                        </div>

                                        <div className="space-y-6">
                                            <div className="grid grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="time_limit_ms"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                                                Time Limit (ms)
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    className="h-11 bg-card/50 border-border/60 focus:border-primary/50 text-foreground"
                                                                    {...field}
                                                                    onChange={(e) =>
                                                                        field.onChange(
                                                                            parseInt(
                                                                                e.target.value,
                                                                            ),
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
                                                            <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                                                Memory Limit (MB)
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    className="h-11 bg-card/50 border-border/60 focus:border-primary/50 text-foreground"
                                                                    {...field}
                                                                    onChange={(e) =>
                                                                        field.onChange(
                                                                            parseInt(
                                                                                e.target.value,
                                                                            ),
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
                                                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
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
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-border/40">
                                        <FormField
                                            control={form.control}
                                            name="allowed_languages"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 block">
                                                        Allowed Languages
                                                    </FormLabel>
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                                        {languages.map((lang: any) => {
                                                            const isSelected = field.value.includes(
                                                                lang.id,
                                                            );
                                                            return (
                                                                <div
                                                                    key={lang.id}
                                                                    onClick={() =>
                                                                        handleLanguageChange(
                                                                            lang.id,
                                                                            !isSelected,
                                                                        )
                                                                    }
                                                                    className={`cursor-pointer rounded-xl border p-4 flex items-center gap-3 transition-all ${
                                                                        isSelected
                                                                            ? "border-primary bg-primary/5 shadow-sm"
                                                                            : "border-border/60 bg-card hover:border-primary/30 hover:bg-primary/5"
                                                                    }`}
                                                                >
                                                                    <div
                                                                        className={`flex h-5 w-5 items-center justify-center rounded border ${isSelected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-muted"}`}
                                                                    >
                                                                        {isSelected && (
                                                                            <CheckCircle2 className="h-3 w-3" />
                                                                        )}
                                                                    </div>
                                                                    <span
                                                                        className={`text-sm font-semibold ${isSelected ? "text-foreground" : "text-muted-foreground"}`}
                                                                    >
                                                                        {lang.slug?.toUpperCase() ||
                                                                            lang.name}
                                                                    </span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* STEP 1: STATEMENT */}
                            {currentStep === 1 && (
                                <div className="max-w-4xl mx-auto p-8 h-full flex flex-col">
                                    <div className="space-y-1 mb-6 shrink-0">
                                        <h2 className="text-2xl font-bold text-foreground">
                                            Problem Statement
                                        </h2>
                                        <p className="text-sm text-muted-foreground">
                                            Write a clear description using Markdown. Include
                                            constraints and examples.
                                        </p>
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="question_text"
                                        render={({ field }) => (
                                            <FormItem className="flex-1 flex flex-col min-h-0">
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Describe the problem..."
                                                        className="flex-1 resize-none border-border/60 bg-card/50 focus-visible:ring-primary/50 text-base p-6 rounded-xl shadow-sm"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}

                            {/* STEP 2: JUDGE CONFIGURATION */}
                            {currentStep === 2 && (
                                <div className="flex h-full w-full">
                                    {/* Left Sidebar */}
                                    <div className="w-64 shrink-0 border-r border-border/60 bg-muted/20 p-4 space-y-6 overflow-y-auto">
                                        <div className="space-y-1">
                                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-3 mb-2">
                                                Problem
                                            </h3>
                                            <div className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground cursor-not-allowed">
                                                <span>Details</span>
                                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                            </div>
                                            <div className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground cursor-not-allowed">
                                                <span>Statement</span>
                                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-3 mb-2">
                                                Judge Configuration
                                            </h3>
                                            {CONFIG_TABS.map((tab) => {
                                                const Icon = tab.icon;
                                                const isActive = activeConfigTab === tab.id;
                                                return (
                                                    <button
                                                        key={tab.id}
                                                        type="button"
                                                        onClick={() => setActiveConfigTab(tab.id)}
                                                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                                            isActive
                                                                ? "bg-primary/10 text-primary"
                                                                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-2.5">
                                                            <Icon className="h-4 w-4" />
                                                            {tab.label}
                                                        </div>
                                                        {isActive && (
                                                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Right Content Area */}
                                    <div className="flex-1 bg-background overflow-y-auto p-8">
                                        {/* TEST CASES */}
                                        {activeConfigTab === "test_cases" && (
                                            <div className="space-y-6 max-w-6xl mx-auto">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h2 className="text-2xl font-bold text-foreground">
                                                            Test Cases
                                                        </h2>
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            Create input and expected output pairs
                                                            to test solutions.
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            className="h-9 px-4 gap-2 border-border/60"
                                                        >
                                                            <Upload className="h-4 w-4" /> Import
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            className="h-9 px-4 gap-2 shadow-sm"
                                                            onClick={() => {
                                                                appendTestcase({
                                                                    input: "",
                                                                    output: "",
                                                                    is_hidden: false,
                                                                    weight: 1,
                                                                });
                                                                setActiveTestCase(
                                                                    testcaseFields.length,
                                                                );
                                                            }}
                                                        >
                                                            <Plus className="h-4 w-4" /> Add Test
                                                            Case
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className="flex border border-border/60 rounded-xl bg-card overflow-hidden shadow-sm h-[600px]">
                                                    {/* Test Cases List */}
                                                    <div className="w-64 shrink-0 border-r border-border/60 flex flex-col bg-muted/10">
                                                        <div className="flex items-center border-b border-border/60 p-1">
                                                            <button
                                                                type="button"
                                                                className="flex-1 py-2 text-xs font-bold text-primary border-b-2 border-primary"
                                                            >
                                                                All ({testcaseFields.length})
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="flex-1 py-2 text-xs font-bold text-muted-foreground hover:text-foreground"
                                                            >
                                                                Hidden (
                                                                {
                                                                    testcaseFields.filter((t) =>
                                                                        form.getValues(
                                                                            `testcases.${testcaseFields.findIndex((f) => f.id === t.id)}.is_hidden`,
                                                                        ),
                                                                    ).length
                                                                }
                                                                )
                                                            </button>
                                                        </div>
                                                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                                                            {testcaseFields.map((field, index) => {
                                                                const isActive =
                                                                    activeTestCase === index;
                                                                return (
                                                                    <div
                                                                        key={field.id}
                                                                        onClick={() =>
                                                                            setActiveTestCase(index)
                                                                        }
                                                                        className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${isActive ? "bg-primary/10 text-primary" : "hover:bg-muted/50 text-foreground"}`}
                                                                    >
                                                                        <span className="text-sm font-medium">
                                                                            Sample Test Case{" "}
                                                                            {index + 1}
                                                                        </span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                        <div className="p-4 border-t border-border/60">
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                className="w-full gap-2 border-primary/20 text-primary hover:bg-primary/5 border-dashed"
                                                                onClick={() => {
                                                                    appendTestcase({
                                                                        input: "",
                                                                        output: "",
                                                                        is_hidden: false,
                                                                        weight: 1,
                                                                    });
                                                                    setActiveTestCase(
                                                                        testcaseFields.length,
                                                                    );
                                                                }}
                                                            >
                                                                <Plus className="h-4 w-4" /> Add
                                                                Test Case
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    {/* Test Case Editor */}
                                                    <div className="flex-1 flex flex-col p-6 bg-background">
                                                        {testcaseFields.length > 0 &&
                                                        activeTestCase < testcaseFields.length ? (
                                                            <div className="flex-1 flex flex-col space-y-6">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="space-y-1.5 flex-1 max-w-md">
                                                                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                                                            Test Case Name
                                                                        </label>
                                                                        <Input
                                                                            value={`Sample Test Case ${activeTestCase + 1}`}
                                                                            disabled
                                                                            className="bg-muted/50 border-border/60 h-10"
                                                                        />
                                                                    </div>
                                                                    <FormField
                                                                        control={form.control}
                                                                        name={`testcases.${activeTestCase}.is_hidden`}
                                                                        render={({ field }) => (
                                                                            <FormItem className="flex items-center gap-3 space-y-0 mt-6">
                                                                                <FormLabel className="text-sm font-medium text-muted-foreground">
                                                                                    Hidden Test Case
                                                                                </FormLabel>
                                                                                <FormControl>
                                                                                    <Switch
                                                                                        checked={
                                                                                            field.value
                                                                                        }
                                                                                        onCheckedChange={
                                                                                            field.onChange
                                                                                        }
                                                                                    />
                                                                                </FormControl>
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                </div>

                                                                <div className="grid grid-cols-2 gap-6 flex-1 min-h-0">
                                                                    <FormField
                                                                        control={form.control}
                                                                        name={`testcases.${activeTestCase}.input`}
                                                                        render={({ field }) => (
                                                                            <FormItem className="flex flex-col h-full space-y-1.5">
                                                                                <div className="flex items-center justify-between">
                                                                                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                                                                        Input
                                                                                    </FormLabel>
                                                                                    <span className="text-[10px] text-muted-foreground">
                                                                                        Format ⌄
                                                                                    </span>
                                                                                </div>
                                                                                <FormControl>
                                                                                    <Textarea
                                                                                        className="flex-1 resize-none font-mono text-sm bg-muted/20 border-border/60 focus-visible:ring-primary/50 rounded-xl p-4"
                                                                                        {...field}
                                                                                    />
                                                                                </FormControl>
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                    <FormField
                                                                        control={form.control}
                                                                        name={`testcases.${activeTestCase}.output`}
                                                                        render={({ field }) => (
                                                                            <FormItem className="flex flex-col h-full space-y-1.5">
                                                                                <div className="flex items-center justify-between">
                                                                                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                                                                        Expected
                                                                                        Output
                                                                                    </FormLabel>
                                                                                    <span className="text-[10px] text-muted-foreground">
                                                                                        Format ⌄
                                                                                    </span>
                                                                                </div>
                                                                                <FormControl>
                                                                                    <Textarea
                                                                                        className="flex-1 resize-none font-mono text-sm bg-muted/20 border-border/60 focus-visible:ring-primary/50 rounded-xl p-4"
                                                                                        {...field}
                                                                                    />
                                                                                </FormControl>
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                </div>

                                                                <div className="flex items-center justify-between pt-4 border-t border-border/40 mt-auto">
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        className="text-red-500 border-red-500/20 hover:bg-red-500/10 gap-2 h-9"
                                                                        onClick={() => {
                                                                            removeTestcase(
                                                                                activeTestCase,
                                                                            );
                                                                            setActiveTestCase(
                                                                                Math.max(
                                                                                    0,
                                                                                    activeTestCase -
                                                                                        1,
                                                                                ),
                                                                            );
                                                                        }}
                                                                        disabled={
                                                                            testcaseFields.length <=
                                                                            1
                                                                        }
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />{" "}
                                                                        Delete Test Case
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="flex-1 flex items-center justify-center text-muted-foreground">
                                                                Select or create a test case.
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* TEMPLATES (Starter, Driver, Solution) */}
                                        {(activeConfigTab === "starter_code" ||
                                            activeConfigTab === "driver_code" ||
                                            activeConfigTab === "reference_solution") && (
                                            <div className="space-y-6 max-w-6xl mx-auto h-full flex flex-col">
                                                <div>
                                                    <h2 className="text-2xl font-bold text-foreground capitalize">
                                                        {activeConfigTab.replace("_", " ")}
                                                    </h2>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        Configure language specific code for this
                                                        section.
                                                    </p>
                                                </div>

                                                {selectedLangIds.length === 0 ? (
                                                    <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border/60 rounded-xl bg-card">
                                                        <Code className="h-12 w-12 text-muted-foreground/30 mb-4" />
                                                        <p className="text-muted-foreground">
                                                            No languages selected. Go back to
                                                            Details to select languages.
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="flex-1 flex flex-col space-y-4 min-h-0">
                                                        <div className="flex flex-wrap gap-2">
                                                            {selectedLangIds.map(
                                                                (langId: number) => {
                                                                    const lang = languages.find(
                                                                        (l: any) => l.id === langId,
                                                                    );
                                                                    return (
                                                                        <div
                                                                            key={langId}
                                                                            className="px-4 py-2 text-sm font-bold bg-primary/10 text-primary border border-primary/20 rounded-lg"
                                                                        >
                                                                            {lang?.slug?.toUpperCase() ||
                                                                                langId}
                                                                        </div>
                                                                    );
                                                                },
                                                            )}
                                                        </div>
                                                        <div className="flex-1 border border-border/60 rounded-xl bg-muted/10 p-6 overflow-y-auto">
                                                            {selectedLangIds.map(
                                                                (langId: number) => {
                                                                    const templateIdx =
                                                                        activeTemplates.findIndex(
                                                                            (t) =>
                                                                                t.language_id ===
                                                                                langId,
                                                                        );
                                                                    const lang = languages.find(
                                                                        (l: any) => l.id === langId,
                                                                    );
                                                                    if (templateIdx === -1)
                                                                        return null;

                                                                    const fieldName =
                                                                        activeConfigTab ===
                                                                        "reference_solution"
                                                                            ? "solution_code"
                                                                            : activeConfigTab;

                                                                    return (
                                                                        <div
                                                                            key={langId}
                                                                            className="mb-8 last:mb-0"
                                                                        >
                                                                            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                                                                                <Languages className="h-4 w-4" />{" "}
                                                                                {lang?.name ||
                                                                                    langId}
                                                                            </h3>
                                                                            <FormField
                                                                                control={
                                                                                    form.control
                                                                                }
                                                                                name={
                                                                                    `templates.${templateIdx}.${fieldName}` as any
                                                                                }
                                                                                render={({
                                                                                    field,
                                                                                }) => (
                                                                                    <FormItem>
                                                                                        <FormControl>
                                                                                            <Textarea
                                                                                                className="font-mono text-sm bg-card/50 border-border/60 focus-visible:ring-primary/50 min-h-[200px]"
                                                                                                {...field}
                                                                                            />
                                                                                        </FormControl>
                                                                                    </FormItem>
                                                                                )}
                                                                            />
                                                                        </div>
                                                                    );
                                                                },
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* 4. Sticky Footer */}
                <div className="sticky bottom-0 z-30 flex items-center justify-between border-t border-border/60 bg-background/80 px-6 py-4 backdrop-blur-md">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={prevStep}
                        disabled={currentStep === 0}
                        className="gap-2 border-border/60 h-10 px-5"
                    >
                        <ChevronLeft className="h-4 w-4" /> Previous
                    </Button>

                    {currentStep < STEPS.length - 1 ? (
                        <Button
                            type="button"
                            onClick={nextStep}
                            className="gap-2 h-10 px-6 shadow-md shadow-primary/10"
                        >
                            Next Step <ChevronRight className="h-4 w-4" />
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            onClick={() => {
                                const currentIndex = CONFIG_TABS.findIndex(
                                    (t) => t.id === activeConfigTab,
                                );
                                if (currentIndex < CONFIG_TABS.length - 1) {
                                    setActiveConfigTab(CONFIG_TABS[currentIndex + 1].id);
                                }
                            }}
                            className="gap-2 h-10 px-6"
                            disabled={activeConfigTab === CONFIG_TABS[CONFIG_TABS.length - 1].id}
                        >
                            Next{" "}
                            {CONFIG_TABS.find((t) => t.id === activeConfigTab)?.label || "Section"}{" "}
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </form>
        </Form>
    );
}
