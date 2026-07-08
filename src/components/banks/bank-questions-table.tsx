"use client";

import {
    ArrowUpDown,
    FileCode2,
    Filter,
    Loader2,
    Search,
    SortAsc,
    Tag as TagIcon,
    Trash2,
} from "lucide-react";
import { useState } from "react";

import type { QuestionListSummaryResponse } from "@/api/generated/model";
import { AppPagination } from "@/components/shared/app-pagination";
import { AsyncStateHandler } from "@/components/shared/async-state-handler";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import {
    bankQuestionsKey,
    useGetBankQuestions,
    useRemoveQuestionsFromBank,
} from "@/query/bank-query";

import { BankQuestionRow } from "./bank-question-row";

interface BankQuestionsTableProps {
    bankId: string;
}

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
            onSuccess: () => setSelectedIds([]),
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
    const selectedCount = selectedIds.length;

    const handleSort = (field: string) => {
        const newOrder = sortBy === field && sortOrder === "asc" ? "desc" : "asc";
        setSortBy(field);
        setSortOrder(newOrder);
        setPage(1);
    };

    const toggleSelection = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((current) => current !== id) : [...prev, id],
        );
    };

    const removeQuestionIds = (ids: string[]) => {
        if (ids.length === 0) return;
        removeMutation.mutate({
            bankId,
            data: { question_ids: ids },
        });
    };

    return (
        <>
            {/* Toolbar */}
            <div className="sticky top-0 z-20 flex min-h-[72px] flex-col justify-center rounded-t-2xl border border-b-0 border-border/60 bg-background/80 px-6 py-3 backdrop-blur-md transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3 flex-1">
                        <div className="relative min-w-[200px] flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                            <Input
                                placeholder="Search by name..."
                                className="pl-9 bg-background border-border/60 focus:border-primary/50 transition-colors h-10 shadow-sm"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                            />
                        </div>
                        <div className="relative min-w-[180px] flex-1">
                            <TagIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                            <Input
                                placeholder="Filter by tag..."
                                className="pl-9 bg-background border-border/60 focus:border-primary/50 transition-colors h-10 shadow-sm"
                                value={tagName}
                                onChange={(e) => {
                                    setTagName(e.target.value);
                                    setPage(1);
                                }}
                            />
                        </div>
                        <Select
                            value={difficulty}
                            onValueChange={(val) => {
                                setDifficulty(val);
                                setPage(1);
                            }}
                        >
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
                            <Select value={sortBy} onValueChange={(val) => handleSort(val)}>
                                <SelectTrigger className="w-[130px] border-none bg-transparent h-8 text-xs font-semibold focus:ring-0">
                                    <SortAsc className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
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
                                aria-label={`Toggle sort direction (${sortOrder === "asc" ? "ascending" : "descending"})`}
                                title="Toggle sort direction"
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

                    {selectedCount > 0 && (
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
                            <Button
                                variant="destructive"
                                size="sm"
                                className="gap-2 h-9 px-4 shadow-lg shadow-destructive/20"
                                onClick={() => removeQuestionIds(selectedIds)}
                                disabled={removeMutation.isPending}
                            >
                                {removeMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Trash2 className="h-4 w-4" />
                                )}
                                Remove ({selectedCount})
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

            <div className="overflow-hidden rounded-b-2xl border border-border/60 bg-card shadow-sm">
                <AsyncStateHandler
                    isLoading={isLoading}
                    isError={isError}
                    error={error}
                    onRetry={refetch}
                >
                    {questions.length === 0 ? (
                        <EmptyState
                            className="m-6"
                            icon={FileCode2}
                            title="No questions found"
                            description="Try adjusting your search or filters, or add questions to this bank."
                        />
                    ) : (
                        <>
                            <div className="grid grid-cols-[48px_1fr_120px_200px_110px] items-center gap-4 border-b border-border/60 bg-muted/40 px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                                <div className="flex justify-center">
                                    <Checkbox
                                        checked={
                                            selectedIds.length === questions.length &&
                                            questions.length > 0
                                        }
                                        onCheckedChange={(checked) =>
                                            setSelectedIds(
                                                checked ? questions.map((q) => q.id) : [],
                                            )
                                        }
                                    />
                                </div>
                                <div
                                    className="flex items-center gap-2 cursor-pointer hover:text-foreground transition-colors"
                                    onClick={() => handleSort("name")}
                                >
                                    Title{" "}
                                    {sortBy === "name" && (
                                        <ArrowUpDown
                                            className={cn(
                                                "h-3 w-3",
                                                sortOrder === "desc" && "rotate-180",
                                            )}
                                        />
                                    )}
                                </div>
                                <div
                                    className="flex items-center justify-center gap-2 cursor-pointer hover:text-foreground transition-colors"
                                    onClick={() => handleSort("difficulty")}
                                >
                                    Difficulty{" "}
                                    {sortBy === "difficulty" && (
                                        <ArrowUpDown
                                            className={cn(
                                                "h-3 w-3",
                                                sortOrder === "desc" && "rotate-180",
                                            )}
                                        />
                                    )}
                                </div>
                                <div>Tags</div>
                                <div className="px-2 text-right">Actions</div>
                            </div>
                            <div className="divide-y divide-border/50">
                                {questions.map((question) => (
                                    <BankQuestionRow
                                        key={question.id}
                                        bankId={bankId}
                                        question={question}
                                        isSelected={selectedIds.includes(question.id)}
                                        toggleSelection={() => toggleSelection(question.id)}
                                        onRemove={() => removeQuestionIds([question.id])}
                                    />
                                ))}
                            </div>
                        </>
                    )}

                    {pagination && (
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-border/40 px-6 py-4 bg-muted/10">
                            <p className="text-xs text-muted-foreground font-medium">
                                Showing{" "}
                                <span className="font-bold text-foreground">
                                    {(pagination.page - 1) * pagination.page_size +
                                        (questions.length ? 1 : 0)}
                                </span>{" "}
                                to{" "}
                                <span className="font-bold text-foreground">
                                    {(pagination.page - 1) * pagination.page_size +
                                        questions.length}
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
                </AsyncStateHandler>
            </div>
        </>
    );
}
