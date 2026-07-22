"use client";

import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Check, ChevronsUpDown, Plus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { QuestionDifficulty } from "@/api/generated/model/questionDifficulty";
import { QuestionType } from "@/api/generated/model/questionType";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { tagKeys, useCreateTag, usePlatformLanguages, useTags } from "@/query/contest-query";

export const MIN_QUESTION_MARK = 0;
export const MAX_QUESTION_MARK = 10000;

interface ProblemMetadataCardProps {
    title: string;
    setTitle: (val: string) => void;
    questionType: QuestionType;
    setQuestionType: (val: QuestionType) => void;
    typeLocked?: boolean;
    difficulty: QuestionDifficulty;
    setDifficulty: (val: QuestionDifficulty) => void;
    timeLimit: number;
    setTimeLimit: (val: number) => void;
    memoryLimit: number;
    setMemoryLimit: (val: number) => void;
    score: number;
    setScore: (val: number) => void;
    duration: string;
    setDuration: (val: string) => void;
    allowedLanguages: number[];
    setAllowedLanguages: (val: number[]) => void;
    tags: string[];
    setTags: (val: string[]) => void;
    maxSubmission: string;
    setMaxSubmission: (val: string) => void;
    isContest?: boolean;
}

const DIFFICULTY_OPTIONS = [
    {
        value: "EASY",
        label: "Easy",
        activeColor:
            "border-emerald-500 text-emerald-600 bg-emerald-500/10 dark:text-emerald-400 dark:bg-emerald-500/20 dark:border-emerald-500/50",
    },
    {
        value: "MEDIUM",
        label: "Medium",
        activeColor:
            "border-amber-500 text-amber-600 bg-amber-500/10 dark:text-amber-400 dark:bg-amber-500/20 dark:border-amber-500/50",
    },
    {
        value: "HARD",
        label: "Hard",
        activeColor:
            "border-red-500 text-red-600 bg-red-500/10 dark:text-red-400 dark:bg-red-500/20 dark:border-red-500/50",
    },
] as const;

export function ProblemMetadataCard({
    title,
    setTitle,
    questionType,
    setQuestionType,
    typeLocked = false,
    difficulty,
    setDifficulty,
    timeLimit,
    setTimeLimit,
    memoryLimit,
    setMemoryLimit,
    score,
    setScore,
    duration,
    setDuration,
    maxSubmission,
    setMaxSubmission,
    allowedLanguages,
    setAllowedLanguages,
    tags,
    setTags,
    isContest = true,
}: ProblemMetadataCardProps) {
    const isSql = questionType === QuestionType.SQL;
    const queryClient = useQueryClient();
    const { data: languagesData } = usePlatformLanguages();
    const { data: tagsData } = useTags();
    const { mutateAsync: createTag } = useCreateTag();
    const [open, setOpen] = useState(false);
    const [tagOpen, setTagOpen] = useState(false);
    const [tagInput, setTagInput] = useState("");

    // Process languages from API response
    const languages = languagesData?.data?.languages || [];

    // Process tags from API response
    const availableTags = (tagsData as any)?.data || [];

    const toggleLanguage = (id: number) => {
        const numericId = Number(id);
        if (allowedLanguages.some((l) => Number(l) === numericId)) {
            setAllowedLanguages(allowedLanguages.filter((l) => Number(l) !== numericId));
        } else {
            setAllowedLanguages([...allowedLanguages, numericId]);
        }
    };

    const handleCreateTag = async () => {
        if (!tagInput.trim()) return;

        try {
            const result = await createTag({ data: { name: tagInput.trim() } });

            // Invalidate tags query to refresh the list
            queryClient.invalidateQueries({ queryKey: tagKeys() });

            const newTag = (result as any)?.data;
            if (newTag) {
                if (!tags.includes(newTag.id)) {
                    setTags([...tags, newTag.id]);
                }
                setTagInput("");
                setTagOpen(false);
                toast.success(`Tag "${newTag.name}" created`);
            }
        } catch {
            toast.error("Failed to create tag");
        }
    };

    const toggleTag = (id: string) => {
        const stringId = String(id);
        if (tags.some((t) => String(t) === stringId)) {
            setTags(tags.filter((t) => String(t) !== stringId));
        } else {
            setTags([...tags, stringId]);
        }
    };

    const removeTag = (tagIdToRemove: string) => {
        const stringId = String(tagIdToRemove);
        setTags(tags.filter((t) => String(t) !== stringId));
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-card p-6 md:p-8 shadow-sm space-y-6"
        >
            <div className="space-y-1">
                <h2 className="text-xl font-bold text-foreground">Details</h2>
                <p className="text-xs text-muted-foreground">
                    Provide basic information about the question.
                </p>
            </div>

            <div className="space-y-5">
                {/* 1. Question Title */}
                <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                        Question Title <span className="text-red-500 font-bold">*</span>
                    </Label>
                    <Input
                        placeholder="Enter a concise and meaningful title"
                        className="bg-background border-border/60 focus:border-primary/50 transition-colors shadow-sm h-9 text-sm rounded-lg"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                {/* 1b. Question Type */}
                <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                        Question Type <span className="text-red-500 font-bold">*</span>
                    </Label>
                    <div className="flex gap-3">
                        {[
                            {
                                value: QuestionType.STANDARD,
                                label: "Standard",
                                hint: "stdin / stdout program",
                            },
                            {
                                value: QuestionType.SQL,
                                label: "SQL",
                                hint: "SQLite query judged on results",
                            },
                        ].map((opt) => {
                            const isActive = questionType === opt.value;
                            return (
                                <button
                                    key={opt.value}
                                    type="button"
                                    disabled={typeLocked}
                                    onClick={() => setQuestionType(opt.value)}
                                    className={cn(
                                        "flex-1 py-2.5 px-4 rounded-lg border text-left transition-all duration-200 outline-none",
                                        typeLocked
                                            ? "cursor-not-allowed opacity-70"
                                            : "cursor-pointer",
                                        isActive
                                            ? "border-primary text-primary bg-primary/10 dark:bg-primary/20 dark:border-primary/50"
                                            : "border-border/60 hover:border-primary/40 bg-card hover:bg-muted/40 text-muted-foreground",
                                    )}
                                >
                                    <span className="block text-xs font-semibold">{opt.label}</span>
                                    <span className="block text-[10px] text-muted-foreground/70 mt-0.5">
                                        {opt.hint}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                    {typeLocked && (
                        <p className="text-[10px] text-muted-foreground/60 leading-tight">
                            Question type cannot be changed after creation.
                        </p>
                    )}
                </div>

                {/* 2. Difficulty Custom Buttons */}
                <div className="space-y-1.5">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                        Difficulty <span className="text-red-500 font-bold">*</span>
                    </Label>
                    <div className="flex gap-3">
                        {DIFFICULTY_OPTIONS.map((opt) => {
                            const isActive = difficulty === opt.value;
                            return (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setDifficulty(opt.value as any)}
                                    className={cn(
                                        "flex-1 py-2 px-4 rounded-lg border text-xs font-semibold transition-all duration-200 cursor-pointer text-center outline-none",
                                        isActive
                                            ? opt.activeColor
                                            : "border-border/60 hover:border-primary/40 bg-card hover:bg-muted/40 text-muted-foreground",
                                    )}
                                >
                                    {opt.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 3. Numerical Metrics Rows */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Score */}
                    {isContest && (
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                                Score / Points <span className="text-red-500 font-bold">*</span>
                            </Label>
                            <Input
                                type="number"
                                value={score}
                                onChange={(e) => setScore(Number(e.target.value))}
                                className={cn(
                                    "bg-background border-border/60 focus:border-primary/50 transition-colors shadow-sm h-9 text-sm rounded-lg",
                                    (score < MIN_QUESTION_MARK || score > MAX_QUESTION_MARK) &&
                                        "border-destructive focus:border-destructive",
                                )}
                            />
                            {score < MIN_QUESTION_MARK && (
                                <p className="text-[11px] text-destructive font-medium">
                                    Score must be at least {MIN_QUESTION_MARK}.
                                </p>
                            )}
                            {score > MAX_QUESTION_MARK && (
                                <p className="text-[11px] text-destructive font-medium">
                                    Score cannot exceed {MAX_QUESTION_MARK}.
                                </p>
                            )}
                            <p className="text-[10px] text-muted-foreground/60 leading-tight">
                                Points awarded for a correct solution.
                            </p>
                        </div>
                    )}

                    {/* Duration */}
                    {isContest && (
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                                Duration (minutes)
                            </Label>
                            <Input
                                placeholder="e.g. 120"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                className="bg-background border-border/60 focus:border-primary/50 transition-colors shadow-sm h-9 text-sm rounded-lg"
                            />
                            <p className="text-[10px] text-muted-foreground/60 leading-tight">
                                Suggested duration for the challenge.
                            </p>
                        </div>
                    )}

                    {/* Max Submissions */}
                    {isContest && (
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                                Max Submissions
                            </Label>
                            <Input
                                placeholder="e.g. 5"
                                type="number"
                                value={maxSubmission}
                                onChange={(e) => setMaxSubmission(e.target.value)}
                                className="bg-background border-border/60 focus:border-primary/50 transition-colors shadow-sm h-9 text-sm rounded-lg"
                            />
                            <p className="text-[10px] text-muted-foreground/60 leading-tight">
                                Maximum submissions allowed for this question. Leave blank for no
                                limit.
                            </p>
                        </div>
                    )}

                    {/* Time Limit */}
                    {!isSql && (
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                                Time Limit (ms) <span className="text-red-500 font-bold">*</span>
                            </Label>
                            <Input
                                type="number"
                                value={timeLimit}
                                onChange={(e) => setTimeLimit(Number(e.target.value))}
                                className="bg-background border-border/60 focus:border-primary/50 transition-colors shadow-sm h-9 text-sm rounded-lg"
                            />
                            <p className="text-[10px] text-muted-foreground/60 leading-tight">
                                Maximum execution time allowed per test case.
                            </p>
                        </div>
                    )}

                    {/* Memory Limit */}
                    {!isSql && (
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                                Memory Limit (MB) <span className="text-red-500 font-bold">*</span>
                            </Label>
                            <Input
                                type="number"
                                value={memoryLimit}
                                onChange={(e) => setMemoryLimit(Number(e.target.value))}
                                className="bg-background border-border/60 focus:border-primary/50 transition-colors shadow-sm h-9 text-sm rounded-lg"
                            />
                            <p className="text-[10px] text-muted-foreground/60 leading-tight">
                                Maximum memory allocated per test case.
                            </p>
                        </div>
                    )}
                </div>

                {/* 4. Languages and Tags in double columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Allowed Languages */}
                    {isSql ? (
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                                Language
                            </Label>
                            <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/20 px-3 h-9">
                                <Badge
                                    variant="secondary"
                                    className="bg-primary/10 text-primary border-primary/20 px-2 py-0.5 text-[10px] font-medium"
                                >
                                    SQL (SQLite)
                                </Badge>
                                <span className="text-[10px] text-muted-foreground/70">
                                    Fixed for SQL questions.
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                                Allowed Languages <span className="text-red-500 font-bold">*</span>
                            </Label>
                            <div className="flex flex-col gap-2.5">
                                <Popover open={open} onOpenChange={setOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={open}
                                            className="justify-between bg-background border-border/60 h-9 hover:bg-background/80 transition-colors shadow-sm rounded-lg text-left font-normal px-3"
                                        >
                                            <span className="text-muted-foreground text-xs">
                                                {allowedLanguages.length > 0
                                                    ? `${allowedLanguages.length} selected`
                                                    : "Select allowed languages..."}
                                            </span>
                                            <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-[var(--radix-popover-trigger-width)] p-0 border-border/40 shadow-xl backdrop-blur-xl bg-background/95"
                                        align="start"
                                    >
                                        <Command className="bg-transparent">
                                            <CommandInput
                                                placeholder="Search languages..."
                                                className="h-9 border-none focus:ring-0 text-xs"
                                            />
                                            <CommandList className="max-h-[250px]">
                                                <CommandEmpty>No languages found.</CommandEmpty>
                                                <CommandGroup>
                                                    {languages.map((lang: any) => (
                                                        <CommandItem
                                                            key={lang.id}
                                                            value={`${lang.name || ""} ${lang.slug || ""} ${lang.id}`.trim()}
                                                            onSelect={() => toggleLanguage(lang.id)}
                                                            className="cursor-pointer py-2 px-3 aria-selected:bg-primary/10 transition-colors text-xs"
                                                        >
                                                            <div className="flex items-center gap-2 flex-1">
                                                                <div
                                                                    className={cn(
                                                                        "flex h-3.5 w-3.5 items-center justify-center rounded border border-primary/30 transition-all",
                                                                        allowedLanguages.some(
                                                                            (l) =>
                                                                                Number(l) ===
                                                                                Number(lang.id),
                                                                        )
                                                                            ? "bg-primary border-primary"
                                                                            : "bg-transparent",
                                                                    )}
                                                                >
                                                                    {allowedLanguages.some(
                                                                        (l) =>
                                                                            Number(l) ===
                                                                            Number(lang.id),
                                                                    ) && (
                                                                        <Check className="h-2.5 w-2.5 text-primary-foreground" />
                                                                    )}
                                                                </div>
                                                                <span className="font-medium">
                                                                    {lang.name ||
                                                                        lang.label ||
                                                                        lang.slug ||
                                                                        `Language ${lang.id}`}
                                                                </span>
                                                                {(lang.slug ||
                                                                    lang.file_extension) && (
                                                                    <span className="text-[9px] uppercase tracking-wider bg-muted px-1.5 py-0.5 rounded ml-auto text-muted-foreground font-bold">
                                                                        {lang.slug ||
                                                                            lang.file_extension}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                        {allowedLanguages.length > 0 && (
                                            <div className="flex items-center justify-between p-2 border-t border-border/40 bg-muted/50 backdrop-blur-md">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setAllowedLanguages([]);
                                                    }}
                                                    className="text-[9px] h-7 px-2 hover:bg-red-500/10 hover:text-red-500 font-bold uppercase tracking-wider transition-colors"
                                                >
                                                    Clear
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setOpen(false);
                                                    }}
                                                    className="text-[9px] h-7 px-2 hover:bg-primary/10 text-primary font-bold uppercase tracking-wider transition-colors"
                                                >
                                                    Done
                                                </Button>
                                            </div>
                                        )}
                                    </PopoverContent>
                                </Popover>

                                {/* Languages Badges */}
                                <div className="flex flex-wrap gap-1.5 min-h-[36px] p-1.5 rounded-lg bg-muted/20 dark:bg-muted/10 border border-border/20 border-dashed">
                                    {allowedLanguages.length === 0 ? (
                                        <span className="text-[10px] text-muted-foreground/60 italic flex items-center px-1.5">
                                            No languages selected.
                                        </span>
                                    ) : (
                                        allowedLanguages.map((id) => {
                                            const lang = languages.find(
                                                (l: any) => Number(l.id) === Number(id),
                                            );
                                            if (!lang) return null;
                                            return (
                                                <Badge
                                                    key={id}
                                                    variant="secondary"
                                                    className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 px-2 py-0.5 flex items-center gap-1 group transition-all"
                                                >
                                                    <span className="font-medium text-[10px]">
                                                        {lang.name}
                                                    </span>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            toggleLanguage(Number(id));
                                                        }}
                                                        className="h-auto w-auto p-0.5 rounded-sm hover:bg-red-500/10 transition-colors"
                                                    >
                                                        <X className="h-2.5 w-2.5 text-red-500" />
                                                    </Button>
                                                </Badge>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tags Selection */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                            Tags
                        </Label>
                        <div className="flex flex-col gap-2.5">
                            <Popover open={tagOpen} onOpenChange={setTagOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={tagOpen}
                                        className="justify-between bg-background border-border/60 h-9 hover:bg-background/80 transition-colors shadow-sm rounded-lg text-left font-normal px-3"
                                    >
                                        <span className="text-muted-foreground text-xs">
                                            {tags.length > 0
                                                ? `${tags.length} selected`
                                                : "Search or create tags..."}
                                        </span>
                                        <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-[var(--radix-popover-trigger-width)] p-0 border-border/40 shadow-xl backdrop-blur-xl bg-background/95"
                                    align="start"
                                >
                                    <Command className="bg-transparent" loop>
                                        <CommandInput
                                            placeholder="Type to search or create..."
                                            className="h-9 border-none focus:ring-0 text-xs"
                                            value={tagInput}
                                            onValueChange={setTagInput}
                                        />
                                        <CommandList className="max-h-[250px]">
                                            <CommandEmpty className="p-0">
                                                <div className="p-2">
                                                    <Button
                                                        variant="ghost"
                                                        className="w-full justify-start gap-1.5 h-8 text-[11px] text-primary hover:bg-primary/10"
                                                        onClick={handleCreateTag}
                                                    >
                                                        <Plus className="h-3.5 w-3.5" />
                                                        Create &quot;{tagInput}&quot;
                                                    </Button>
                                                </div>
                                            </CommandEmpty>
                                            <CommandGroup>
                                                {availableTags.map((tag: any) => (
                                                    <CommandItem
                                                        key={tag.id}
                                                        value={`${tag.name} ${tag.id}`}
                                                        onSelect={() => {
                                                            toggleTag(tag.id);
                                                            setTagInput("");
                                                        }}
                                                        className="cursor-pointer py-2 px-3 aria-selected:bg-primary/10 transition-colors text-xs"
                                                    >
                                                        <div className="flex items-center gap-2 flex-1">
                                                            <div
                                                                className={cn(
                                                                    "flex h-3.5 w-3.5 items-center justify-center rounded border border-primary/30 transition-all",
                                                                    tags.some(
                                                                        (t) =>
                                                                            String(t) ===
                                                                            String(tag.id),
                                                                    )
                                                                        ? "bg-primary border-primary"
                                                                        : "bg-transparent",
                                                                )}
                                                            >
                                                                {tags.some(
                                                                    (t) =>
                                                                        String(t) ===
                                                                        String(tag.id),
                                                                ) && (
                                                                    <Check className="h-2.5 w-2.5 text-primary-foreground" />
                                                                )}
                                                            </div>
                                                            <span className="font-medium text-xs">
                                                                {tag.name}
                                                            </span>
                                                        </div>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                    {tags.length > 0 && (
                                        <div className="flex items-center justify-between p-2 border-t border-border/40 bg-muted/50 backdrop-blur-md">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setTags([]);
                                                }}
                                                className="text-[9px] h-7 px-2 hover:bg-red-500/10 hover:text-red-500 font-bold uppercase tracking-wider transition-colors"
                                            >
                                                Clear
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setTagOpen(false);
                                                }}
                                                className="text-[9px] h-7 px-2 hover:bg-primary/10 text-primary font-bold uppercase tracking-wider transition-colors"
                                            >
                                                Done
                                            </Button>
                                        </div>
                                    )}
                                </PopoverContent>
                            </Popover>

                            {/* Tags Badges */}
                            <div className="flex flex-wrap gap-1.5 min-h-[36px] p-1.5 rounded-lg bg-muted/20 dark:bg-muted/10 border border-border/20 border-dashed">
                                {tags.length === 0 ? (
                                    <span className="text-[10px] text-muted-foreground/60 italic flex items-center px-1.5">
                                        No tags selected.
                                    </span>
                                ) : (
                                    tags.map((tagId) => {
                                        const tag = availableTags.find(
                                            (t: any) => String(t.id) === String(tagId),
                                        );
                                        return (
                                            <Badge
                                                key={tagId}
                                                variant="outline"
                                                className="bg-background border-border/60 text-muted-foreground px-2 py-0.5 flex items-center gap-1 group hover:border-primary/40 hover:text-foreground transition-all"
                                            >
                                                <span className="text-[10px]">
                                                    {tag?.name || "Loading..."}
                                                </span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        removeTag(tagId);
                                                    }}
                                                    className="h-auto w-auto p-0.5 rounded-sm hover:bg-red-500/10 transition-colors"
                                                >
                                                    <X className="h-2.5 w-2.5 text-red-500" />
                                                </Button>
                                            </Badge>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
