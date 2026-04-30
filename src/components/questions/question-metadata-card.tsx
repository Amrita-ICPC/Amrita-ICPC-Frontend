"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, X, Check, ChevronsUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { usePlatformLanguages, useTags, useCreateTag, tagKeys } from "@/query/contest-query";
import { toast } from "sonner";
import { QuestionDifficulty } from "@/api/generated/model/questionDifficulty";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ProblemMetadataCardProps {
    title: string;
    setTitle: (val: string) => void;
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
}

export function ProblemMetadataCard({
    title,
    setTitle,
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
    allowedLanguages,
    setAllowedLanguages,
    tags,
    setTags,
}: ProblemMetadataCardProps) {
    const queryClient = useQueryClient();
    const { data: languagesData, isLoading: isLoadingLanguages } = usePlatformLanguages();
    const { data: tagsData, isLoading: isLoadingTags } = useTags();
    const { mutateAsync: createTag } = useCreateTag();
    const [open, setOpen] = useState(false);
    const [tagOpen, setTagOpen] = useState(false);
    const [tagInput, setTagInput] = useState("");

    // Process languages from API response - using the updated API structure
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
        } catch (error) {
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border/60 bg-gradient-to-br from-card/30 to-muted/10 backdrop-blur-md p-8 shadow-xl"
        >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-8">
                {/* Row 1 */}
                <div className="space-y-3 md:col-span-8">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        placeholder="Enter question title"
                        className="bg-background/50 border-border/40 focus:border-primary/50 transition-colors shadow-sm h-11"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                <div className="space-y-3 md:col-span-4">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Difficulty <span className="text-red-500">*</span>
                    </Label>
                    <Select
                        value={difficulty}
                        onValueChange={(val) => setDifficulty(val as QuestionDifficulty)}
                    >
                        <SelectTrigger className="bg-background/50 border-border/40 shadow-sm h-11">
                            <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="EASY">Easy</SelectItem>
                            <SelectItem value="MEDIUM">Medium</SelectItem>
                            <SelectItem value="HARD">Hard</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Row 2: Metrics */}
                <div className="space-y-3 md:col-span-6 lg:col-span-3 pt-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Time Limit (ms) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        type="number"
                        value={timeLimit}
                        onChange={(e) => setTimeLimit(Number(e.target.value))}
                        className="bg-background/50 border-border/40 focus:border-primary/50 transition-colors shadow-sm h-11"
                    />
                </div>

                <div className="space-y-3 md:col-span-6 lg:col-span-3 pt-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Memory Limit (MB) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        type="number"
                        value={memoryLimit}
                        onChange={(e) => setMemoryLimit(Number(e.target.value))}
                        className="bg-background/50 border-border/40 focus:border-primary/50 transition-colors shadow-sm h-11"
                    />
                </div>

                <div className="space-y-3 md:col-span-6 lg:col-span-3 pt-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Score <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        type="number"
                        value={score}
                        onChange={(e) => setScore(Number(e.target.value))}
                        className="bg-background/50 border-border/40 focus:border-primary/50 transition-colors shadow-sm h-11"
                    />
                </div>

                <div className="space-y-3 md:col-span-6 lg:col-span-3 pt-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Duration (minutes)
                    </Label>
                    <Input
                        placeholder="e.g. 120"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="bg-background/50 border-border/40 focus:border-primary/50 transition-colors shadow-sm h-11"
                    />
                </div>

                {/* Row 3: Languages & Tags */}
                <div className="space-y-3 md:col-span-12 lg:col-span-6 pt-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Allowed Languages <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex flex-col gap-3">
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={open}
                                    className="justify-between bg-background/50 border-border/40 h-11 hover:bg-background/80 transition-colors shadow-sm"
                                >
                                    <span className="text-muted-foreground">
                                        {allowedLanguages.length > 0
                                            ? `${allowedLanguages.length} languages selected`
                                            : "Select allowed languages..."}
                                    </span>
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-[var(--radix-popover-trigger-width)] p-0 border-border/40 shadow-2xl backdrop-blur-xl bg-background/95"
                                align="start"
                            >
                                <Command className="bg-transparent">
                                    <CommandInput
                                        placeholder="Search languages..."
                                        className="h-11 border-none focus:ring-0"
                                    />
                                    <CommandList className="max-h-[300px]">
                                        <CommandEmpty>No languages found.</CommandEmpty>
                                        <CommandGroup>
                                            {languages.map((lang: any) => (
                                                <CommandItem
                                                    key={lang.id}
                                                    value={`${lang.name || ""} ${lang.slug || ""} ${lang.id}`.trim()}
                                                    onSelect={() => toggleLanguage(lang.id)}
                                                    className="cursor-pointer py-3 px-4 aria-selected:bg-primary/10 transition-colors"
                                                >
                                                    <div className="flex items-center gap-2 flex-1">
                                                        <div
                                                            className={cn(
                                                                "flex h-4 w-4 items-center justify-center rounded border border-primary/30 transition-all",
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
                                                                    Number(l) === Number(lang.id),
                                                            ) && (
                                                                <Check className="h-3 w-3 text-primary-foreground" />
                                                            )}
                                                        </div>
                                                        <span className="font-medium">
                                                            {lang.name ||
                                                                lang.label ||
                                                                lang.slug ||
                                                                `Language ${lang.id}`}
                                                        </span>
                                                        {(lang.slug || lang.file_extension) && (
                                                            <span className="text-[10px] uppercase tracking-wider bg-muted px-1.5 py-0.5 rounded ml-auto text-muted-foreground font-bold">
                                                                {lang.slug || lang.file_extension}
                                                            </span>
                                                        )}
                                                    </div>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                                {allowedLanguages.length > 0 && (
                                    <div className="flex items-center justify-between p-3 border-t border-border/40 bg-muted/50 backdrop-blur-md">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setAllowedLanguages([]);
                                            }}
                                            className="text-[10px] h-8 px-3 hover:bg-red-500/10 hover:text-red-500 font-bold uppercase tracking-wider transition-colors"
                                        >
                                            Clear All
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setOpen(false);
                                            }}
                                            className="text-[10px] h-8 px-3 hover:bg-primary/10 text-primary font-bold uppercase tracking-wider transition-colors"
                                        >
                                            Done
                                        </Button>
                                    </div>
                                )}
                            </PopoverContent>
                        </Popover>

                        {/* Selected Languages Badges */}
                        <div className="flex flex-wrap gap-2 min-h-[40px] p-2 rounded-xl bg-muted/20 border border-border/20 border-dashed">
                            {allowedLanguages.length === 0 ? (
                                <p className="text-[10px] text-muted-foreground/60 italic flex items-center px-2">
                                    No languages selected. Participants won&apos;t be able to
                                    submit.
                                </p>
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
                                            className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 px-2 py-1 flex items-center gap-1.5 group transition-all animate-in fade-in zoom-in-95"
                                        >
                                            <span className="font-medium">{lang.name}</span>
                                            {lang.slug && (
                                                <span className="text-[10px] opacity-40 font-mono bg-primary/10 px-1 rounded uppercase tracking-tighter">
                                                    {lang.slug}
                                                </span>
                                            )}
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    toggleLanguage(Number(id));
                                                }}
                                                className="ml-1 h-auto w-auto p-0.5 rounded-sm hover:bg-red-500/10 transition-colors"
                                            >
                                                <X className="h-3.5 w-3.5 opacity-60 hover:opacity-100 text-red-500" />
                                            </Button>
                                        </Badge>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-3 md:col-span-12 lg:col-span-6 pt-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Tags
                    </Label>
                    <div className="flex flex-col gap-3">
                        <Popover open={tagOpen} onOpenChange={setTagOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={tagOpen}
                                    className="justify-between bg-background/50 border-border/40 h-11 hover:bg-background/80 transition-colors shadow-sm"
                                >
                                    <span className="text-muted-foreground text-sm font-normal">
                                        {tags.length > 0
                                            ? `${tags.length} tags selected`
                                            : "Search or create tags..."}
                                    </span>
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-[var(--radix-popover-trigger-width)] p-0 border-border/40 shadow-2xl backdrop-blur-xl bg-background/95"
                                align="start"
                            >
                                <Command className="bg-transparent" loop>
                                    <CommandInput
                                        placeholder="Type to search or create..."
                                        className="h-11 border-none focus:ring-0"
                                        value={tagInput}
                                        onValueChange={setTagInput}
                                    />
                                    <CommandList className="max-h-[300px]">
                                        {isLoadingTags && (
                                            <div className="flex items-center justify-center p-4">
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                            </div>
                                        )}
                                        <CommandEmpty className="p-0">
                                            <div className="p-2">
                                                <Button
                                                    variant="ghost"
                                                    className="w-full justify-start gap-2 h-10 text-primary hover:bg-primary/10"
                                                    onClick={handleCreateTag}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                    Create tag &quot;{tagInput}&quot;
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
                                                    className="cursor-pointer py-3 px-4 aria-selected:bg-primary/10 transition-colors"
                                                >
                                                    <div className="flex items-center gap-2 flex-1">
                                                        <div
                                                            className={cn(
                                                                "flex h-4 w-4 items-center justify-center rounded border border-primary/30 transition-all",
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
                                                                (t) => String(t) === String(tag.id),
                                                            ) && (
                                                                <Check className="h-3 w-3 text-primary-foreground" />
                                                            )}
                                                        </div>
                                                        <span className="font-medium text-sm">
                                                            {tag.name}
                                                        </span>
                                                    </div>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                                {tags.length > 0 && (
                                    <div className="flex items-center justify-between p-3 border-t border-border/40 bg-muted/50 backdrop-blur-md">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setTags([]);
                                            }}
                                            className="text-[10px] h-8 px-3 hover:bg-red-500/10 hover:text-red-500 font-bold uppercase tracking-wider transition-colors"
                                        >
                                            Clear All
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setTagOpen(false);
                                            }}
                                            className="text-[10px] h-8 px-3 hover:bg-primary/10 text-primary font-bold uppercase tracking-wider transition-colors"
                                        >
                                            Done
                                        </Button>
                                    </div>
                                )}
                            </PopoverContent>
                        </Popover>

                        {/* Tags Badges */}
                        <div className="flex flex-wrap gap-2 min-h-[40px] p-2 rounded-xl bg-muted/20 border border-border/20 border-dashed">
                            {tags.length === 0 ? (
                                <p className="text-[10px] text-muted-foreground/60 italic flex items-center px-2">
                                    No tags selected.
                                </p>
                            ) : (
                                tags.map((tagId) => {
                                    const tag = availableTags.find(
                                        (t: any) => String(t.id) === String(tagId),
                                    );
                                    return (
                                        <Badge
                                            key={tagId}
                                            variant="outline"
                                            className="bg-background border-border/60 text-muted-foreground px-2 py-1 flex items-center gap-1 group hover:border-primary/40 hover:text-foreground transition-all animate-in fade-in zoom-in-95"
                                        >
                                            {tag?.name || "Loading..."}
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    removeTag(tagId);
                                                }}
                                                className="ml-1 h-auto w-auto p-0.5 rounded-sm hover:bg-red-500/10 transition-colors"
                                            >
                                                <X className="h-3.5 w-3.5 opacity-60 hover:opacity-100 text-red-500" />
                                            </Button>
                                        </Badge>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
