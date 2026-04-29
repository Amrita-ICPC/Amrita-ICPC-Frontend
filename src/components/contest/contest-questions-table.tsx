"use client";

import Link from "next/link";
import { useState } from "react";
import {
    FileCode2,
    Search,
    MoreVertical,
    Edit,
    Trash2,
    GripVertical,
    Filter,
    ArrowUpDown,
    Eye,
} from "lucide-react";
import { Reorder, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppPagination } from "@/components/shared/app-pagination";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { QuestionListSummaryResponse, PaginationResponse } from "@/api/generated/model";

interface ContestQuestionsTableProps {
    contestId: string;
    questions: QuestionListSummaryResponse[];
    pagination?: PaginationResponse;
    isLoading: boolean;
    onPageChange: (page: number) => void;
    onSearchChange: (search: string) => void;
    onDifficultyChange: (difficulty: string) => void;
}

export function ContestQuestionsTable({
    contestId,
    questions,
    pagination,
    isLoading,
    onPageChange,
    onSearchChange,
    onDifficultyChange,
}: ContestQuestionsTableProps) {
    const [search, setSearch] = useState("");
    const [difficulty, setDifficulty] = useState("ALL");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [prevQuestions, setPrevQuestions] = useState(questions);
    const [orderedQuestions, setOrderedQuestions] = useState(questions);

    // Sync local ordered list when props change (e.g. pagination/filtering)
    if (questions !== prevQuestions) {
        setPrevQuestions(questions);
        setOrderedQuestions(questions);
    }

    const handleSearch = (val: string) => {
        setSearch(val);
        onSearchChange(val);
    };

    const handleDifficulty = (val: string) => {
        setDifficulty(val);
        onDifficultyChange(val);
    };

    const handleSwitch = () => {
        if (selectedIds.length !== 2) return;
        const newQuestions = [...orderedQuestions];
        const idx1 = newQuestions.findIndex((q) => q.id === selectedIds[0]);
        const idx2 = newQuestions.findIndex((q) => q.id === selectedIds[1]);
        if (idx1 !== -1 && idx2 !== -1) {
            const temp = newQuestions[idx1];
            newQuestions[idx1] = newQuestions[idx2];
            newQuestions[idx2] = temp;
            setOrderedQuestions(newQuestions);
            setSelectedIds([]);
        }
    };

    const toggleSelection = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
        );
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-muted/20 p-4 rounded-xl border border-border/40 backdrop-blur-sm">
                <div className="flex items-center gap-3 flex-1 min-w-[300px]">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by title..."
                            className="pl-9 bg-background/50 border-border/40 focus:border-primary/50 transition-colors"
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>
                    <Select value={difficulty} onValueChange={handleDifficulty}>
                        <SelectTrigger className="w-[140px] bg-background/50 border-border/40">
                            <Filter className="h-3.5 w-3.5 mr-2 opacity-60" />
                            <SelectValue placeholder="Difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Levels</SelectItem>
                            <SelectItem value="EASY">Easy</SelectItem>
                            <SelectItem value="MEDIUM">Medium</SelectItem>
                            <SelectItem value="HARD">Hard</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-2">
                    {selectedIds.length === 2 && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-primary/40 text-primary hover:bg-primary/5 gap-2 h-9"
                            onClick={handleSwitch}
                        >
                            <ArrowUpDown className="h-4 w-4" />
                            Switch Position
                        </Button>
                    )}
                    {selectedIds.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-foreground h-9"
                            onClick={() => setSelectedIds([])}
                        >
                            Clear Selection ({selectedIds.length})
                        </Button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-border/60 bg-card/20 backdrop-blur-sm overflow-hidden shadow-2xl">
                <div className="grid grid-cols-[48px_80px_1fr_120px_200px_140px] items-center gap-4 px-6 py-4 border-b border-border/40 bg-muted/30 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">
                    <div className="flex justify-center">
                        <Checkbox
                            checked={
                                selectedIds.length === orderedQuestions.length &&
                                orderedQuestions.length > 0
                            }
                            onCheckedChange={(checked) =>
                                setSelectedIds(checked ? orderedQuestions.map((q) => q.id) : [])
                            }
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        Order <ArrowUpDown className="h-3 w-3 opacity-50" />
                    </div>
                    <div>Problem Details</div>
                    <div className="text-center">Difficulty</div>
                    <div>Tags</div>
                    <div className="text-right px-2">Actions</div>
                </div>

                <Reorder.Group
                    axis="y"
                    values={orderedQuestions}
                    onReorder={setOrderedQuestions}
                    className="divide-y divide-border/10"
                >
                    <AnimatePresence initial={false}>
                        {orderedQuestions.map((question, index) => (
                            <Reorder.Item
                                key={question.id}
                                value={question}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className={`group grid grid-cols-[48px_80px_1fr_120px_200px_140px] items-center gap-4 px-6 py-4 transition-all duration-200 ${
                                    selectedIds.includes(question.id)
                                        ? "bg-primary/10 border-l-2 border-l-primary"
                                        : "bg-transparent hover:bg-white/[0.03] border-l-2 border-l-transparent"
                                }`}
                            >
                                <div
                                    className="flex justify-center"
                                    onPointerDown={(e) => e.stopPropagation()}
                                >
                                    <Checkbox
                                        checked={selectedIds.includes(question.id)}
                                        onCheckedChange={() => toggleSelection(question.id)}
                                    />
                                </div>
                                <div className="flex items-center gap-3">
                                    <GripVertical className="h-4 w-4 text-muted-foreground/20 group-hover:text-muted-foreground/50 transition-colors cursor-grab active:cursor-grabbing" />
                                    <span className="font-mono text-xs text-muted-foreground/60 font-bold">
                                        {index + 1}
                                    </span>
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="font-bold text-foreground text-sm truncate group-hover:text-primary transition-colors duration-200">
                                        {question.question_text.split("\n")[0].substring(0, 60)}
                                    </span>
                                    <span className="text-xs text-muted-foreground/50 truncate group-hover:text-muted-foreground/70 transition-colors">
                                        {question.question_text
                                            .split("\n")
                                            .slice(1)
                                            .join(" ")
                                            .substring(0, 100) || "No description provided"}
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
                                    {question.tags?.slice(0, 2).map((tag) => (
                                        <Badge
                                            key={tag.id}
                                            variant="secondary"
                                            className="bg-muted/30 text-[9px] border-none text-muted-foreground/80"
                                        >
                                            {tag.name}
                                        </Badge>
                                    ))}
                                    {(question.tags?.length ?? 0) > 2 && (
                                        <span className="text-[10px] text-muted-foreground/30 font-bold">
                                            +{question.tags!.length - 2}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center justify-end gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground/40 hover:text-foreground hover:bg-muted/50"
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
                                            href={`/contest/${contestId}/questions/${question.id}/edit`}
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
                            </Reorder.Item>
                        ))}
                    </AnimatePresence>
                </Reorder.Group>

                {orderedQuestions.length === 0 && !isLoading && (
                    <div className="flex flex-col items-center justify-center py-20 bg-muted/5 text-muted-foreground">
                        <FileCode2 className="h-16 w-16 opacity-5 mb-4" />
                        <h3 className="text-lg font-bold text-foreground">No questions found</h3>
                        <p className="text-sm max-w-xs text-center mt-1 text-muted-foreground/60">
                            Try adjusting your search or filters.
                        </p>
                    </div>
                )}
                {/* Pagination Footer */}
                {pagination && (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-border/40 px-6 py-4 bg-muted/10">
                        <p className="text-xs text-muted-foreground">
                            Showing{" "}
                            <span className="font-medium text-foreground">
                                {(pagination.page - 1) * pagination.page_size +
                                    (orderedQuestions.length ? 1 : 0)}
                            </span>{" "}
                            to{" "}
                            <span className="font-medium text-foreground">
                                {(pagination.page - 1) * pagination.page_size +
                                    orderedQuestions.length}
                            </span>{" "}
                            of{" "}
                            <span className="font-medium text-foreground">{pagination.total}</span>{" "}
                            questions
                        </p>
                        <AppPagination
                            currentPage={pagination.page}
                            totalPages={pagination.total_pages}
                            hasNext={pagination.has_next}
                            hasPrevious={pagination.has_previous}
                            onPageChange={onPageChange}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
