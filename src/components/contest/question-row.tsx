"use client";

import { GripVertical, Eye, Edit, MoreVertical, Trash2 } from "lucide-react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { QuestionListSummaryResponse, PaginationResponse } from "@/api/generated/model";
import { cn } from "@/lib/utils";

interface QuestionRowProps {
    question: QuestionListSummaryResponse;
    index: number;
    contestId: string;
    pagination?: PaginationResponse;
    isSelected: boolean;
    toggleSelection: () => void;
    dragHandleProps?: any;
    isDragging?: boolean;
    isOverlay?: boolean;
}

export function QuestionRow({
    question,
    index,
    contestId,
    pagination,
    isSelected,
    toggleSelection,
    dragHandleProps,
    isDragging,
    isOverlay,
}: QuestionRowProps) {
    return (
        <div
            className={cn(
                "group grid grid-cols-[48px_80px_1fr_120px_200px_140px] items-center gap-4 px-6 py-4",
                !isDragging && !isOverlay && "transition-colors duration-200",
                isDragging && !isOverlay && "opacity-20 bg-muted/50",
                isOverlay &&
                    "bg-background shadow-xl border-2 border-primary/40 rounded-lg cursor-grabbing z-[999]",
                isSelected && !isOverlay && "bg-primary/10 border-l-2 border-l-primary",
                !isSelected &&
                    !isOverlay &&
                    "bg-transparent hover:bg-white/[0.03] border-l-2 border-l-transparent",
            )}
        >
            <div className="flex justify-center" onPointerDown={(e) => e.stopPropagation()}>
                <Checkbox checked={isSelected} onCheckedChange={toggleSelection} />
            </div>
            <div className="flex items-center gap-3">
                <div
                    className={cn(
                        "p-1 hover:bg-muted/40 rounded-md transition-colors",
                        isOverlay ? "cursor-grabbing" : "cursor-grab",
                    )}
                    {...dragHandleProps}
                >
                    <GripVertical className="h-4 w-4 text-muted-foreground/20 group-hover:text-muted-foreground/50 transition-colors" />
                </div>
                <span className="font-mono text-xs text-muted-foreground/60 font-bold">
                    {(pagination?.page ? (pagination.page - 1) * pagination.page_size : 0) +
                        index +
                        1}
                </span>
            </div>
            <div className="flex flex-col min-w-0">
                <span className="font-bold text-foreground text-sm truncate group-hover:text-primary transition-colors duration-200">
                    {question.title}
                </span>
            </div>
            <div className="flex justify-center">
                <Badge
                    variant="outline"
                    className={`px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border-2 ${
                        question.difficulty === "EASY"
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 group-hover:border-emerald-500/40"
                            : question.difficulty === "MEDIUM"
                              ? "bg-amber-500/10 text-amber-500 border-amber-500/20 group-hover:border-amber-500/40"
                              : "bg-red-500/10 text-red-500 border-red-500/20 group-hover:border-red-500/40"
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
                                        className="bg-muted/30 text-[9px] border-none text-muted-foreground/80"
                                    >
                                        {tag.name}
                                    </Badge>
                                ))}
                                {question.tags.length > 2 && (
                                    <span className="text-[10px] text-muted-foreground/30 font-bold self-center">
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
                    <span className="text-[10px] text-muted-foreground/20 italic">No tags</span>
                )}
            </div>
            <div className="flex items-center justify-end gap-1">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground/40 hover:text-foreground hover:bg-muted/50"
                    aria-label="Preview question"
                >
                    <Eye className="h-3.5 w-3.5" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground/40 hover:text-foreground hover:bg-muted/50"
                    asChild
                >
                    <Link
                        href={`/contest/${contestId}/questions/${question.id}?edit=1`}
                        aria-label="Edit question"
                    >
                        <Edit className="h-3.5 w-3.5" />
                    </Link>
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground/40 hover:text-foreground hover:bg-muted/50"
                            aria-label="More options"
                        >
                            <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer">
                            <Trash2 className="mr-2 h-4 w-4" /> Remove
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
