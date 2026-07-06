"use client";

import { Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import type { QuestionListSummaryResponse } from "@/api/generated/model";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface BankQuestionRowProps {
    bankId: string;
    question: QuestionListSummaryResponse;
    isSelected: boolean;
    toggleSelection: () => void;
    onRemove: () => void;
}

export function BankQuestionRow({
    bankId,
    question,
    isSelected,
    toggleSelection,
    onRemove,
}: BankQuestionRowProps) {
    const router = useRouter();
    const previewHref = `/banks/${bankId}/questions/${question.id}`;

    return (
        <div
            onClick={(event) => {
                const target = event.target as HTMLElement;
                if (target.closest("a, button, [role='checkbox'], [data-row-action]")) return;
                router.push(previewHref);
            }}
            className={cn(
                "group grid cursor-pointer grid-cols-[48px_1fr_120px_200px_110px] items-center gap-4 bg-card px-6 py-5 transition-colors duration-200",
                isSelected && "bg-primary/10 border-l-2 border-l-primary",
                !isSelected && "hover:bg-muted/25",
            )}
        >
            <div className="flex justify-center">
                <Checkbox checked={isSelected} onCheckedChange={toggleSelection} />
            </div>
            <div className="flex flex-col min-w-0">
                <Link
                    href={previewHref}
                    className="font-bold text-foreground text-sm truncate group-hover:text-primary transition-colors duration-200"
                >
                    {question.title}
                </Link>
            </div>
            <div className="flex justify-center">
                <Badge
                    variant="outline"
                    className={`px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border-2 ${
                        question.difficulty === "EASY"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 group-hover:border-emerald-500/40"
                            : question.difficulty === "MEDIUM"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 group-hover:border-amber-500/40"
                              : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 group-hover:border-red-500/40"
                    } transition-colors duration-200`}
                >
                    {question.difficulty}
                </Badge>
            </div>
            <div className="flex flex-wrap gap-1.5 overflow-hidden">
                {question.tags && question.tags.length > 0 ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                aria-label="View all tags"
                                className="flex flex-wrap items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md"
                            >
                                {question.tags.slice(0, 2).map((tag) => (
                                    <Badge
                                        key={tag.id}
                                        variant="secondary"
                                        className="bg-muted text-[9px] border-none text-muted-foreground font-semibold"
                                    >
                                        {tag.name}
                                    </Badge>
                                ))}
                                {question.tags.length > 2 && (
                                    <span className="text-[10px] text-muted-foreground/60 font-bold self-center">
                                        +{question.tags.length - 2}
                                    </span>
                                )}
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-48 p-2">
                            <div className="flex flex-wrap gap-1.5">
                                {question.tags.map((tag) => (
                                    <Badge
                                        key={tag.id}
                                        variant="secondary"
                                        className="bg-muted/50 text-[10px] border-none text-muted-foreground"
                                    >
                                        {tag.name}
                                    </Badge>
                                ))}
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <span className="text-[10px] text-muted-foreground/40 italic font-medium">
                        No tags
                    </span>
                )}
            </div>
            <div className="flex items-center justify-end gap-1">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground/60 hover:text-foreground hover:bg-muted"
                    asChild
                >
                    <Link
                        href={`/banks/${bankId}/questions/${question.id}?edit=true`}
                        aria-label="Edit question"
                    >
                        <Edit className="h-3.5 w-3.5" />
                    </Link>
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10"
                    aria-label="Remove question from bank"
                    onClick={onRemove}
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </Button>
            </div>
        </div>
    );
}
