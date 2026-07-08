"use client";

import { arrayMove } from "@dnd-kit/sortable";
import {
    ArrowUpDown,
    FileCode2,
    Filter,
    Loader2,
    Save,
    Search,
    SortAsc,
    Tag as TagIcon,
    Trash2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import type { PaginationResponse, QuestionListSummaryResponse } from "@/api/generated/model";
import { AppPagination } from "@/components/shared/app-pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { SortableList } from "@/components/shared/sortable-list";
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
    contestQuestionsKey,
    useRemoveQuestionsFromContest,
    useReorderContestQuestions,
} from "@/query/contest-query";

import { QuestionRow } from "./question-row";
import { QuestionSortableRow } from "./question-sortable-row";

interface ContestQuestionsTableProps {
    contestId: string;
    questions: QuestionListSummaryResponse[];
    pagination?: PaginationResponse;
    isLoading: boolean;
    onPageChange: (page: number) => void;
    onSearchChange: (search: string) => void;
    onDifficultyChange: (difficulty: string) => void;
    onTagChange: (tag: string) => void;
    onSortChange: (sortBy: string, sortOrder: string) => void;
    sortBy?: string;
    sortOrder?: string;
    embedded?: boolean;
}

export function ContestQuestionsTable({
    contestId,
    questions,
    pagination,
    isLoading,
    onPageChange,
    onSearchChange,
    onDifficultyChange,
    onTagChange,
    onSortChange,
    sortBy = "order",
    sortOrder = "asc",
    embedded = false,
}: ContestQuestionsTableProps) {
    const [search, setSearch] = useState("");
    const [difficulty, setDifficulty] = useState("ALL");
    const [tagName, setTagName] = useState("");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [orderedQuestions, setOrderedQuestions] =
        useState<QuestionListSummaryResponse[]>(questions);
    const prevQuestionsRef = useRef<QuestionListSummaryResponse[]>(questions);

    //react-hooks/set-state-in-effect
    useEffect(() => {
        if (prevQuestionsRef.current !== questions) {
            prevQuestionsRef.current = questions;
            setOrderedQuestions(questions);
        }
    }, [questions]);

    const reorderMutation = useReorderContestQuestions({
        mutation: {
            meta: {
                successMessage: "Questions reordered successfully!",
                invalidateKeys: [contestQuestionsKey(contestId)],
            },
        },
    });

    const removeMutation = useRemoveQuestionsFromContest({
        mutation: {
            onSuccess: () => {
                setSelectedIds([]);
            },
            meta: {
                successMessage: "Questions removed successfully!",
                invalidateKeys: [contestQuestionsKey(contestId)],
            },
        },
    });

    const hasOrderChanged = useMemo(() => {
        if (orderedQuestions.length !== questions.length) return false;
        return orderedQuestions.some((q, i) => q.id !== questions[i].id);
    }, [orderedQuestions, questions]);

    const debouncedSearch = useDebounce(search, 500);
    const debouncedTag = useDebounce(tagName, 500);

    const isFirstSearch = useRef(true);
    const isFirstTag = useRef(true);

    // Call handlers when debounced values change
    useEffect(() => {
        if (isFirstSearch.current) {
            isFirstSearch.current = false;
            return;
        }
        onSearchChange(debouncedSearch);
    }, [debouncedSearch, onSearchChange]);

    useEffect(() => {
        if (isFirstTag.current) {
            isFirstTag.current = false;
            return;
        }
        onTagChange(debouncedTag);
    }, [debouncedTag, onTagChange]);

    const handleSearch = (value: string) => {
        setSearch(value);
    };

    const handleDifficulty = (val: string) => {
        setDifficulty(val);
        onDifficultyChange(val);
    };

    const handleTag = (val: string) => {
        setTagName(val);
    };

    const handleSort = (field: string) => {
        const newOrder = sortBy === field && sortOrder === "asc" ? "desc" : "asc";
        onSortChange(field, newOrder);
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

    const handleSaveOrder = () => {
        if (!canReorder) return;
        const reorders = orderedQuestions.map((q, i) => ({
            question_id: q.id,
            order: (pagination?.page ? (pagination.page - 1) * pagination.page_size : 0) + i + 1,
        }));

        reorderMutation.mutate({
            contestId,
            data: { reorders },
        });
    };

    const handleRemoveSelected = () => {
        if (selectedIds.length === 0) return;
        removeMutation.mutate({
            contestId,
            data: { question_ids: selectedIds },
        });
    };

    const toggleSelection = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
        );
    };

    const handleReorder = (activeId: string, overId: string) => {
        setOrderedQuestions((items) => {
            const oldIndex = items.findIndex((i) => i.id === activeId);
            const newIndex = items.findIndex((i) => i.id === overId);
            return arrayMove(items, oldIndex, newIndex);
        });
    };

    const canReorder =
        sortBy === "order" &&
        sortOrder === "asc" &&
        difficulty === "ALL" &&
        search.trim() === "" &&
        tagName.trim() === "";

    return (
        <>
            {/* Toolbar */}
            {(!embedded || selectedIds.length > 0 || hasOrderChanged) && (
                <div className="sticky top-0 z-20 flex min-h-[72px] flex-col justify-center border-b border-border/60 bg-background/80 px-6 py-3 backdrop-blur-md transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        {!embedded && (
                            <div className="flex flex-wrap items-center gap-3 flex-1">
                                <div className="relative min-w-[200px] flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                                    <Input
                                        placeholder="Search by name..."
                                        className="pl-9 bg-background border-border/60 focus:border-primary/50 transition-colors h-10 shadow-sm"
                                        value={search}
                                        onChange={(e) => handleSearch(e.target.value)}
                                    />
                                </div>
                                <div className="relative min-w-[180px] flex-1">
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
                                        onValueChange={(val) => onSortChange(val, sortOrder)}
                                    >
                                        <SelectTrigger className="w-[130px] border-none bg-transparent h-8 text-xs font-semibold focus:ring-0">
                                            <SortAsc className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                            <SelectValue placeholder="Sort By" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="order">Default Order</SelectItem>
                                            <SelectItem value="difficulty">Difficulty</SelectItem>
                                            <SelectItem value="title">Problem Name</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <div className="w-px h-4 bg-border/40" />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 hover:bg-background/60"
                                        aria-label={`Toggle sort direction (${sortOrder === "asc" ? "ascending" : "descending"})`}
                                        title="Toggle sort direction"
                                        onClick={() =>
                                            onSortChange(
                                                sortBy,
                                                sortOrder === "asc" ? "desc" : "asc",
                                            )
                                        }
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
                        )}

                        <div
                            className={cn(
                                "flex items-center gap-2 mt-4 sm:mt-0",
                                embedded && "sm:ml-auto",
                            )}
                        >
                            {selectedIds.length === 2 && canReorder && (
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
                            {hasOrderChanged && canReorder && (
                                <Button
                                    variant="default"
                                    size="sm"
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 h-9 px-4 shadow-lg shadow-primary/20 animate-in fade-in zoom-in duration-200"
                                    onClick={handleSaveOrder}
                                    disabled={reorderMutation.isPending}
                                >
                                    {reorderMutation.isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4" />
                                    )}
                                    Save New Ordering
                                </Button>
                            )}
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
                </div>
            )}

            {/* Table */}
            <div className="flex-1 p-4 md:p-6 pt-2">
                <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
                    <div className="grid grid-cols-[48px_100px_1fr_120px_200px_110px] items-center gap-4 border-b border-border/60 bg-muted/40 px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
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
                        <div
                            className="flex items-center gap-2 cursor-pointer hover:text-foreground transition-colors"
                            onClick={() => handleSort("order")}
                        >
                            Serial No.{" "}
                            {sortBy === "order" && (
                                <ArrowUpDown
                                    className={cn("h-3 w-3", sortOrder === "desc" && "rotate-180")}
                                />
                            )}
                        </div>
                        <div>Title</div>
                        <div
                            className="flex items-center justify-center gap-2 cursor-pointer hover:text-foreground transition-colors"
                            onClick={() => handleSort("difficulty")}
                        >
                            Difficulty{" "}
                            {sortBy === "difficulty" && (
                                <ArrowUpDown
                                    className={cn("h-3 w-3", sortOrder === "desc" && "rotate-180")}
                                />
                            )}
                        </div>
                        <div>Tags</div>
                        <div className="px-2 text-right">Actions</div>
                    </div>

                    <SortableList
                        items={orderedQuestions}
                        onReorder={handleReorder}
                        renderOverlay={(item) => (
                            <QuestionRow
                                question={item}
                                index={orderedQuestions.findIndex((q) => q.id === item.id)}
                                contestId={contestId}
                                pagination={pagination}
                                isSelected={selectedIds.includes(item.id)}
                                toggleSelection={() => toggleSelection(item.id)}
                                isOverlay
                            />
                        )}
                    >
                        <div
                            className={`divide-y divide-border/50 transition-opacity duration-200 ${isLoading ? "opacity-50 pointer-events-none" : "opacity-100"}`}
                        >
                            {orderedQuestions.map((question, index) => (
                                <QuestionSortableRow
                                    key={question.id}
                                    question={question}
                                    index={index}
                                    contestId={contestId}
                                    pagination={pagination}
                                    isSelected={selectedIds.includes(question.id)}
                                    toggleSelection={() => toggleSelection(question.id)}
                                    canReorder={canReorder}
                                    onRemove={() =>
                                        removeMutation.mutate({
                                            contestId,
                                            data: { question_ids: [question.id] },
                                        })
                                    }
                                />
                            ))}
                        </div>
                    </SortableList>

                    {orderedQuestions.length === 0 && !isLoading && (
                        <EmptyState
                            icon={FileCode2}
                            title="No questions found"
                            description="Try adjusting your search or filters, or import questions into this contest."
                        />
                    )}
                    {/* Pagination Footer */}
                    {pagination && !embedded && (
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-border/40 px-6 py-4 bg-muted/10">
                            <p className="text-xs text-muted-foreground font-medium">
                                Showing{" "}
                                <span className="font-bold text-foreground">
                                    {(pagination.page - 1) * pagination.page_size +
                                        (orderedQuestions.length ? 1 : 0)}
                                </span>{" "}
                                to{" "}
                                <span className="font-bold text-foreground">
                                    {(pagination.page - 1) * pagination.page_size +
                                        orderedQuestions.length}
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
                                onPageChange={onPageChange}
                            />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
