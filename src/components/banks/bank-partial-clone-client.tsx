"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
    ArrowUpDown,
    ChevronLeft,
    Copy,
    FileCode2,
    Filter,
    Loader2,
    Search,
    Tag as TagIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { AppPagination } from "@/components/shared/app-pagination";
import { AsyncStateHandler } from "@/components/shared/async-state-handler";
import { type ViewMode, ViewToggle } from "@/components/shared/view-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
    useCloneBankQuestions,
    useGetBankDetail,
    useGetBankQuestions,
} from "@/query/bank-query";

interface BankPartialCloneClientProps {
    targetBankId: string;
    sourceBankId: string;
}

const difficultyColorMap: Record<string, string> = {
    EASY: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-transparent",
    MEDIUM: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-transparent",
    HARD: "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-transparent",
};

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

function TagsPreview({ tags }: { tags?: Array<{ id: string; name: string }> }) {
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

export function BankPartialCloneClient({
    targetBankId,
    sourceBankId,
}: BankPartialCloneClientProps) {
    const router = useRouter();
    const queryClient = useQueryClient();

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

    const { data: sourceBankData } = useGetBankDetail(sourceBankId);
    const sourceBank = sourceBankData?.data;

    const { data, isLoading, isError, error, refetch } = useGetBankQuestions(sourceBankId, {
        skip: (page - 1) * pageSize,
        limit: pageSize,
        title: debouncedSearch || undefined,
        tag: debouncedTag || undefined,
        difficulty: difficulty === "ALL" ? undefined : (difficulty as any),
        sort_by: sortBy as any,
        sort_order: sortOrder as any,
    });

    const cloneMutation = useCloneBankQuestions({
        mutation: {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: bankQuestionsKey(targetBankId) });
                toast.success(`${selectedIds.length} questions cloned successfully!`);
                router.push(`/banks/${targetBankId}`);
            },
        },
    });

    const questionsResponse = (data as any)?.data;
    const questions = (
        Array.isArray(questionsResponse)
            ? questionsResponse
            : questionsResponse?.items || questionsResponse?.questions || []
    ) as Array<{
        id: string;
        title: string;
        difficulty: string;
        tags?: Array<{ id: string; name: string }>;
    }>;
    const pagination = (data as any)?.pagination;

    const handleSort = (field: string) => {
        const newOrder = sortBy === field && sortOrder === "asc" ? "desc" : "asc";
        setSortBy(field);
        setSortOrder(newOrder);
        setPage(1);
    };

    const handleCloneSelected = async () => {
        if (selectedIds.length === 0) return;
        await cloneMutation.mutateAsync({
            sourceBankId,
            data: {
                target_bank_id: targetBankId,
                copy_all: false,
                question_ids: selectedIds,
            },
        });
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

    return (
        <div className="flex animate-in flex-col gap-5 fade-in slide-in-from-bottom-4 duration-500">
            <Card className="border-border/60 py-0">
                <CardContent className="p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                            <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                className="-ml-2 mb-2 text-muted-foreground"
                            >
                                <Link href={`/banks/${targetBankId}`}>
                                    <ChevronLeft data-icon="inline-start" />
                                    Back to Bank
                                </Link>
                            </Button>
                            <div className="flex items-start gap-3">
                                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <Copy className="size-5" />
                                </div>
                                <div className="min-w-0">
                                    <h1 className="text-2xl font-bold tracking-tight">
                                        Clone Questions
                                    </h1>
                                    <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
                                        Select questions from{" "}
                                        <span className="font-medium text-foreground">
                                            {sourceBank?.name || "source bank"}
                                        </span>{" "}
                                        and copy them into this bank.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary" className="h-9 px-3">
                                {selectedIds.length} selected
                            </Badge>
                            <Button
                                onClick={handleCloneSelected}
                                disabled={selectedIds.length === 0 || cloneMutation.isPending}
                            >
                                {cloneMutation.isPending ? (
                                    <Loader2 data-icon="inline-start" className="animate-spin" />
                                ) : (
                                    <Copy data-icon="inline-start" />
                                )}
                                Clone Selected
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-border/60">
                <CardContent className="flex flex-col gap-4 p-4">
                    <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <div className="relative min-w-0 sm:w-72">
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search source questions"
                                    className="pl-9"
                                    value={search}
                                    onChange={(event) => {
                                        setSearch(event.target.value);
                                        setPage(1);
                                    }}
                                />
                            </div>
                            <div className="relative min-w-0 sm:w-52">
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
                                aria-label={
                                    sortOrder === "asc" ? "Sort descending" : "Sort ascending"
                                }
                                title="Toggle sort order"
                            >
                                <ArrowUpDown
                                    className={cn(
                                        "size-4 transition-transform",
                                        sortOrder === "desc" && "rotate-180",
                                    )}
                                />
                            </Button>
                        </div>
                        <ViewToggle view={view} onChange={setView} />
                    </div>

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
                                        className="border-border/60 py-0 transition-all hover:border-primary/40 hover:shadow-md"
                                    >
                                        <CardContent className="flex h-full flex-col gap-3 p-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <Checkbox
                                                    checked={selectedIds.includes(question.id)}
                                                    onCheckedChange={() =>
                                                        toggleSelection(question.id)
                                                    }
                                                />
                                                <DifficultyBadge difficulty={question.difficulty} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="line-clamp-2 font-semibold leading-snug">
                                                    {question.title}
                                                </p>
                                                <div className="mt-3">
                                                    <TagsPreview tags={question.tags} />
                                                </div>
                                            </div>
                                        </CardContent>
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
                                                <TableCell className="font-medium">
                                                    {question.title}
                                                </TableCell>
                                                <TableCell>
                                                    <DifficultyBadge
                                                        difficulty={question.difficulty}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TagsPreview tags={question.tags} />
                                                </TableCell>
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
        </div>
    );
}
