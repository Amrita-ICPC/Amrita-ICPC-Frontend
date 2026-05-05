"use client";

import { useState, useEffect, useMemo } from "react";
import {
    FileCode2,
    Search,
    Trash2,
    Filter,
    ArrowUpDown,
    Loader2,
    CheckCircle2,
    MoreHorizontal,
    Eye,
    Edit2,
    Tag as TagIcon,
} from "lucide-react";
import Link from "next/link";
import { useDebounce } from "@/hooks/use-debounce";
import {
    useGetBankQuestions,
    useRemoveQuestionsFromBank,
    bankQuestionsKey,
} from "@/query/bank-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AppPagination } from "@/components/shared/app-pagination";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AsyncStateHandler } from "@/components/shared/async-state-handler";
import type { QuestionListSummaryResponse } from "@/api/generated/model";

interface BankQuestionsTableProps {
    bankId: string;
}

const difficultyColorMap: Record<string, string> = {
    EASY: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    MEDIUM: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
    HARD: "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20",
};

export function BankQuestionsTable({ bankId }: BankQuestionsTableProps) {
    const [search, setSearch] = useState("");
    const [difficulty, setDifficulty] = useState("ALL");
    const [tagName, setTagName] = useState("");
    const [sortBy, setSortBy] = useState<string>("name");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [page, setPage] = useState(1);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const pageSize = 10;

    const debouncedSearch = useDebounce(search, 500);
    const debouncedTag = useDebounce(tagName, 500);

    const { data, isLoading, isError, error, refetch } = useGetBankQuestions(bankId, {
        skip: (page - 1) * pageSize,
        limit: pageSize,
        title: debouncedSearch || undefined,
        tag: debouncedTag || undefined,
        difficulty: difficulty === "ALL" ? undefined : (difficulty as any),
        sort_by: sortBy as any,
        sort_order: sortOrder as any,
    });

    const removeMutation = useRemoveQuestionsFromBank({
        mutation: {
            onSuccess: () => {
                setSelectedIds([]);
            },
            meta: {
                successMessage: "Questions removed from bank successfully!",
                invalidateKeys: [bankQuestionsKey(bankId)],
            },
        },
    });

    const questionsResponse = (data as any)?.data;
    const questions = (
        Array.isArray(questionsResponse)
            ? questionsResponse
            : questionsResponse?.items || questionsResponse?.questions || []
    ) as QuestionListSummaryResponse[];
    const pagination = (data as any)?.pagination;

    const handleSort = (field: string) => {
        const newOrder = sortBy === field && sortOrder === "asc" ? "desc" : "asc";
        setSortBy(field);
        setSortOrder(newOrder);
        setPage(1);
    };

    const handleSearch = (val: string) => {
        setSearch(val);
        setPage(1);
    };

    const handleTag = (val: string) => {
        setTagName(val);
        setPage(1);
    };

    const handleDifficulty = (val: string) => {
        setDifficulty(val);
        setPage(1);
    };

    const removeQuestionIds = async (ids: string[]) => {
        if (ids.length === 0) return;
        await removeMutation.mutateAsync({
            bankId,
            data: { question_ids: ids },
        });
    };
    const handleRemoveSelected = () => removeQuestionIds(selectedIds);

    const toggleSelection = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
        );
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-muted/40 p-4 rounded-xl border border-border/60 backdrop-blur-md">
                <div className="flex flex-wrap items-center gap-3 flex-1">
                    <div className="relative min-w-[200px] flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                        <Input
                            placeholder="Search questions..."
                            className="pl-9 bg-background border-border/60 focus:border-primary/50 transition-colors h-10 shadow-sm"
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>
                    <div className="relative min-w-[200px] flex-1">
                        <TagIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                        <Input
                            placeholder="Filter by tag..."
                            className="pl-9 bg-background border-border/60 focus:border-primary/50 transition-colors h-10 shadow-sm"
                            value={tagName}
                            onChange={(e) => handleTag(e.target.value)}
                        />
                    </div>
                    <Select value={difficulty} onValueChange={handleDifficulty}>
                        <SelectTrigger className="w-[140px] bg-background border-border/60 h-10 shadow-sm">
                            <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                            <SelectValue placeholder="Difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Levels</SelectItem>
                            <SelectItem value="EASY">Easy</SelectItem>
                            <SelectItem value="MEDIUM">Medium</SelectItem>
                            <SelectItem value="HARD">Hard</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="flex items-center gap-2 bg-background/40 p-1 rounded-lg border border-border/20">
                        <Select
                            value={sortBy}
                            onValueChange={(val) => {
                                setSortBy(val);
                                setPage(1);
                            }}
                        >
                            <SelectTrigger className="w-[130px] border-none bg-transparent h-8 text-xs font-semibold focus:ring-0">
                                <ArrowUpDown className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                <SelectValue placeholder="Sort By" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="name">Problem Name</SelectItem>
                                <SelectItem value="difficulty">Difficulty</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="w-px h-4 bg-border/40" />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-background/60"
                            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                        >
                            <ArrowUpDown
                                className={cn(
                                    "h-3.5 w-3.5 transition-transform duration-200",
                                    sortOrder === "desc" && "rotate-180",
                                )}
                            />
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {selectedIds.length > 0 && (
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
                            <Button
                                variant="destructive"
                                size="sm"
                                className="gap-2 h-9 px-4 shadow-lg shadow-destructive/20"
                                onClick={handleRemoveSelected}
                                disabled={removeMutation.isPending}
                            >
                                {removeMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Trash2 className="h-4 w-4" />
                                )}
                                Remove ({selectedIds.length})
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground hover:text-foreground h-9"
                                onClick={() => setSelectedIds([])}
                            >
                                Cancel
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Table */}
            <AsyncStateHandler
                isLoading={isLoading}
                isError={isError}
                error={error}
                onRetry={refetch}
            >
                <div className="rounded-xl border border-border/60 bg-card/50 backdrop-blur-md overflow-hidden shadow-xl">
                    <div className="grid grid-cols-[48px_1fr_120px_200px_140px] items-center gap-4 px-6 py-4 border-b border-border/60 bg-muted/50 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                        <div className="flex justify-center">
                            <Checkbox
                                checked={
                                    questions.length > 0 &&
                                    questions.every((q) => selectedIds.includes(q.id))
                                }
                                onCheckedChange={(checked) =>
                                    setSelectedIds((prev) => {
                                        const pageIds = questions.map((q) => q.id);
                                        return checked
                                            ? Array.from(new Set([...prev, ...pageIds]))
                                            : prev.filter((id) => !pageIds.includes(id));
                                    })
                                }
                            />
                        </div>
                        <div
                            className="flex items-center gap-2 cursor-pointer hover:text-foreground transition-colors"
                            onClick={() => handleSort("name")}
                        >
                            Question Details
                            {sortBy === "name" && (
                                <ArrowUpDown
                                    className={cn("h-3 w-3", sortOrder === "desc" && "rotate-180")}
                                />
                            )}
                        </div>
                        <div
                            className="flex items-center justify-center gap-2 cursor-pointer hover:text-foreground transition-colors"
                            onClick={() => handleSort("difficulty")}
                        >
                            Difficulty
                            {sortBy === "difficulty" && (
                                <ArrowUpDown
                                    className={cn("h-3 w-3", sortOrder === "desc" && "rotate-180")}
                                />
                            )}
                        </div>
                        <div>Tags</div>
                        <div className="text-right pr-2">Actions</div>
                    </div>

                    <div
                        className={cn(
                            "divide-y divide-border/10 transition-opacity",
                            isLoading && "opacity-50",
                        )}
                    >
                        {questions && questions.length > 0 ? (
                            questions.map((question) => (
                                <div
                                    key={question.id}
                                    className="grid grid-cols-[48px_1fr_120px_200px_140px] items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors group"
                                >
                                    <div className="flex justify-center">
                                        <Checkbox
                                            checked={selectedIds.includes(question.id)}
                                            onCheckedChange={() => toggleSelection(question.id)}
                                        />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-semibold text-foreground group-hover:text-primary transition-colors cursor-pointer truncate">
                                            {question.title}
                                        </span>
                                    </div>
                                    <div className="flex justify-center">
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                "font-semibold px-2 py-0.5",
                                                difficultyColorMap[question.difficulty],
                                            )}
                                        >
                                            {question.difficulty}
                                        </Badge>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {question.tags && question.tags.length > 0 ? (
                                            <>
                                                {question.tags.slice(0, 2).map((tag) => (
                                                    <Badge
                                                        key={tag.id}
                                                        variant="secondary"
                                                        className="bg-muted/50 text-[10px] h-5 px-1.5 font-medium"
                                                    >
                                                        {tag.name}
                                                    </Badge>
                                                ))}
                                                {question.tags.length > 2 && (
                                                    <Badge
                                                        variant="secondary"
                                                        className="bg-muted/50 text-[10px] h-5 px-1.5 font-medium"
                                                    >
                                                        +{question.tags.length - 2}
                                                    </Badge>
                                                )}
                                            </>
                                        ) : (
                                            <span className="text-[10px] text-muted-foreground/40 font-medium italic">
                                                No tags
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-end gap-2 pr-2">
                                        <Button
                                            asChild
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                                            title="View Question"
                                        >
                                            <Link
                                                href={`/banks/${bankId}/questions/${question.id}`}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button
                                            asChild
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                                            title="Edit Question"
                                        >
                                            <Link
                                                href={`/banks/${bankId}/questions/${question.id}?edit=true`}
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:bg-muted transition-colors"
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-40">
                                                <DropdownMenuItem
                                                    className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer gap-2"
                                                    onClick={() => removeQuestionIds([question.id])}
                                                >
                                                    <Trash2 className="h-4 w-4" /> Remove from Bank
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 bg-muted/5 text-muted-foreground">
                                <FileCode2 className="h-16 w-16 opacity-20 mb-4" />
                                <h3 className="text-lg font-bold text-foreground">
                                    No questions found
                                </h3>
                                <p className="text-sm max-w-xs text-center mt-1 text-muted-foreground">
                                    Try adjusting your search or filters.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Pagination Footer */}
                    {pagination && (
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-border/40 px-6 py-4 bg-muted/10">
                            <p className="text-xs text-muted-foreground font-medium">
                                Showing{" "}
                                <span className="font-bold text-foreground">
                                    {(pagination.page - 1) * pagination.page_size +
                                        (questions?.length ? 1 : 0)}
                                </span>{" "}
                                to{" "}
                                <span className="font-bold text-foreground">
                                    {(pagination.page - 1) * pagination.page_size +
                                        (questions?.length || 0)}
                                </span>{" "}
                                of{" "}
                                <span className="font-bold text-foreground">
                                    {pagination.total}
                                </span>{" "}
                                questions
                            </p>
                            <AppPagination
                                currentPage={pagination.page}
                                totalPages={pagination.total_pages}
                                hasNext={pagination.has_next}
                                hasPrevious={pagination.has_previous}
                                onPageChange={setPage}
                            />
                        </div>
                    )}
                </div>
            </AsyncStateHandler>
        </div>
    );
}
