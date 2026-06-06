"use client";

import {
    ArrowUpDown,
    Edit2,
    Eye,
    FileCode2,
    Filter,
    Loader2,
    MoreHorizontal,
    Search,
    Tag as TagIcon,
    Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import type { QuestionListSummaryResponse } from "@/api/generated/model";
import { AppPagination } from "@/components/shared/app-pagination";
import { AsyncStateHandler } from "@/components/shared/async-state-handler";
import { type ViewMode, ViewToggle } from "@/components/shared/view-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import {
    bankQuestionsKey,
    useGetBankQuestions,
    useRemoveQuestionsFromBank,
} from "@/query/bank-query";

interface BankQuestionsTableProps {
    bankId: string;
}

const difficultyColorMap: Record<string, string> = {
    EASY: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-transparent",
    MEDIUM: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-transparent",
    HARD: "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-transparent",
};

function TagsPreview({ tags }: { tags?: QuestionListSummaryResponse["tags"] }) {
    if (!tags || tags.length === 0) {
        return <span className="text-xs text-muted-foreground">No tags</span>;
    }

    return (
        <div className="flex flex-wrap gap-1.5">
            {tags.slice(0, 2).map((tag) => (
                <Badge key={tag.id} variant="secondary" className="h-5 px-1.5 text-[10px]">
                    {tag.name}
                </Badge>
            ))}
            {tags.length > 2 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                    +{tags.length - 2}
                </Badge>
            )}
        </div>
    );
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
    return (
        <Badge
            variant="outline"
            className={cn("border-transparent font-medium", difficultyColorMap[difficulty])}
        >
            {difficulty}
        </Badge>
    );
}

export function BankQuestionsTable({ bankId }: BankQuestionsTableProps) {
    const [view, setView] = useState<ViewMode>("table");
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

    const togglePageSelection = (checked: boolean) => {
        const pageIds = questions.map((question) => question.id);
        setSelectedIds((prev) =>
            checked
                ? Array.from(new Set([...prev, ...pageIds]))
                : prev.filter((id) => !pageIds.includes(id)),
        );
    };

    const removeQuestionIds = (ids: string[]) => {
        if (ids.length === 0) return;
        removeMutation.mutate({
            bankId,
            data: { question_ids: ids },
        });
    };

    const questionActions = (question: QuestionListSummaryResponse) => (
        <div className="flex items-center justify-end gap-1">
            <Button asChild variant="ghost" size="icon" className="size-8">
                <Link href={`/banks/${bankId}/questions/${question.id}`} aria-label="View question">
                    <Eye className="size-4" />
                </Link>
            </Button>
            <Button asChild variant="ghost" size="icon" className="size-8">
                <Link
                    href={`/banks/${bankId}/questions/${question.id}?edit=true`}
                    aria-label="Edit question"
                >
                    <Edit2 className="size-4" />
                </Link>
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        aria-label={`More options for ${question.title}`}
                    >
                        <MoreHorizontal className="size-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem
                        className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                        onClick={() => removeQuestionIds([question.id])}
                    >
                        <Trash2 className="size-4" />
                        Remove from Bank
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );

    return (
        <Card className="border-border/60">
            <CardHeader className="pb-3">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <FileCode2 className="size-5 text-primary" />
                        Question Library
                    </CardTitle>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <div className="relative min-w-0 sm:w-64">
                            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search questions"
                                className="pl-9"
                                value={search}
                                onChange={(event) => {
                                    setSearch(event.target.value);
                                    setPage(1);
                                }}
                            />
                        </div>
                        <div className="relative min-w-0 sm:w-48">
                            <TagIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Filter by tag"
                                className="pl-9"
                                value={tagName}
                                onChange={(event) => {
                                    setTagName(event.target.value);
                                    setPage(1);
                                }}
                            />
                        </div>
                        <Select
                            value={difficulty}
                            onValueChange={(value) => {
                                setDifficulty(value);
                                setPage(1);
                            }}
                        >
                            <SelectTrigger className="w-full sm:w-36">
                                <Filter className="mr-2 size-4 text-muted-foreground" />
                                <SelectValue placeholder="Difficulty" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All levels</SelectItem>
                                <SelectItem value="EASY">Easy</SelectItem>
                                <SelectItem value="MEDIUM">Medium</SelectItem>
                                <SelectItem value="HARD">Hard</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            value={sortBy}
                            onValueChange={(value) => {
                                setSortBy(value);
                                setPage(1);
                            }}
                        >
                            <SelectTrigger className="w-full sm:w-40">
                                <ArrowUpDown className="mr-2 size-4 text-muted-foreground" />
                                <SelectValue placeholder="Sort" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="name">Problem name</SelectItem>
                                <SelectItem value="difficulty">Difficulty</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button
                            variant="outline"
                            size="icon"
                            className="size-9"
                            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                            title="Toggle sort order"
                        >
                            <ArrowUpDown
                                className={cn(
                                    "size-4 transition-transform",
                                    sortOrder === "desc" && "rotate-180",
                                )}
                            />
                        </Button>
                        <ViewToggle view={view} onChange={setView} />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                {selectedCount > 0 && (
                    <div className="flex flex-col gap-2 rounded-lg border bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm font-medium">{selectedCount} selected</p>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setSelectedIds([])}>
                                Clear
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => removeQuestionIds(selectedIds)}
                                disabled={removeMutation.isPending}
                            >
                                {removeMutation.isPending ? (
                                    <Loader2 data-icon="inline-start" className="animate-spin" />
                                ) : (
                                    <Trash2 data-icon="inline-start" />
                                )}
                                Remove
                            </Button>
                        </div>
                    </div>
                )}

                <AsyncStateHandler
                    isLoading={isLoading}
                    isError={isError}
                    error={error}
                    onRetry={refetch}
                >
                    {questions.length === 0 ? (
                        <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-muted-foreground">
                            <FileCode2 className="size-9 opacity-40" />
                            <p className="text-sm font-medium">No questions found</p>
                            <p className="max-w-sm text-center text-xs">
                                Try adjusting your search or filters.
                            </p>
                        </div>
                    ) : view === "grid" ? (
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                            {questions.map((question) => (
                                <Card
                                    key={question.id}
                                    className="group border-border/60 bg-card hover:border-primary/30 transition-all duration-300 hover:shadow-md rounded-[16px] overflow-hidden flex flex-col p-0 gap-0"
                                >
                                    {/* Top Section */}
                                    <div className="relative flex flex-col p-5 bg-blue-500/5 dark:bg-blue-500/10 border-b border-border/40 flex-1">
                                        <div className="relative z-10 flex flex-col h-full">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-3">
                                                    <Checkbox
                                                        className="mt-0.5"
                                                        checked={selectedIds.includes(question.id)}
                                                        onCheckedChange={() =>
                                                            toggleSelection(question.id)
                                                        }
                                                    />
                                                    <Link
                                                        href={`/banks/${bankId}/questions/${question.id}`}
                                                        className="text-[15px] font-bold leading-tight text-foreground transition-colors group-hover:text-primary line-clamp-2"
                                                    >
                                                        {question.title}
                                                    </Link>
                                                </div>
                                            </div>

                                            <div className="mt-4 flex flex-wrap items-center gap-2">
                                                <DifficultyBadge difficulty={question.difficulty} />
                                                <TagsPreview tags={question.tags} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bottom Section (Actions) */}
                                    <div className="flex flex-col px-4 py-2.5 bg-card">
                                        <div className="flex items-center justify-end">
                                            {questionActions(question)}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-lg border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-10">
                                            <Checkbox
                                                checked={
                                                    questions.length > 0 &&
                                                    questions.every((question) =>
                                                        selectedIds.includes(question.id),
                                                    )
                                                }
                                                onCheckedChange={(checked) =>
                                                    togglePageSelection(checked === true)
                                                }
                                            />
                                        </TableHead>
                                        <TableHead
                                            className="cursor-pointer"
                                            onClick={() => handleSort("name")}
                                        >
                                            Question
                                        </TableHead>
                                        <TableHead
                                            className="cursor-pointer"
                                            onClick={() => handleSort("difficulty")}
                                        >
                                            Difficulty
                                        </TableHead>
                                        <TableHead>Tags</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {questions.map((question) => (
                                        <TableRow
                                            key={question.id}
                                            className="group cursor-pointer hover:bg-muted/40 transition-colors"
                                        >
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedIds.includes(question.id)}
                                                    onCheckedChange={() =>
                                                        toggleSelection(question.id)
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Link
                                                    href={`/banks/${bankId}/questions/${question.id}`}
                                                    className="line-clamp-1 font-medium transition-colors hover:text-primary"
                                                >
                                                    {question.title}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                <DifficultyBadge difficulty={question.difficulty} />
                                            </TableCell>
                                            <TableCell>
                                                <TagsPreview tags={question.tags} />
                                            </TableCell>
                                            <TableCell>{questionActions(question)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {pagination && (
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-xs text-muted-foreground">
                                Showing{" "}
                                <span className="font-medium text-foreground">
                                    {(pagination.page - 1) * pagination.page_size +
                                        (questions.length ? 1 : 0)}
                                </span>{" "}
                                to{" "}
                                <span className="font-medium text-foreground">
                                    {(pagination.page - 1) * pagination.page_size +
                                        questions.length}
                                </span>{" "}
                                of{" "}
                                <span className="font-medium text-foreground">
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
            </CardContent>
        </Card>
    );
}
