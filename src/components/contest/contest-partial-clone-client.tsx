"use client";

import { useState } from "react";
import {
    FileCode2,
    Search,
    Filter,
    ArrowUpDown,
    Loader2,
    Copy,
    Tag as TagIcon,
    ChevronLeft,
    Timer,
    Trophy,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { useGetBankQuestions, useGetBankDetail } from "@/query/bank-query";
import { useCloneQuestionsFromBank, contestQuestionsKey } from "@/query/contest-query";
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AsyncStateHandler } from "@/components/shared/async-state-handler";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";

interface ContestPartialCloneClientProps {
    contestId: string;
    sourceBankId: string;
}

const difficultyColorMap: Record<string, string> = {
    EASY: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    MEDIUM: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
    HARD: "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20",
};

export function ContestPartialCloneClient({
    contestId,
    sourceBankId,
}: ContestPartialCloneClientProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const searchParams = useSearchParams();

    // Initial values from query params (set in the dialog)
    const parsedScore = parseInt(searchParams.get("score") ?? "", 10);
    const initialScore = Number.isFinite(parsedScore) ? parsedScore : 100;
    const initialDuration = searchParams.get("duration") || "";

    const [search, setSearch] = useState("");
    const [difficulty, setDifficulty] = useState("ALL");
    const [tagName, setTagName] = useState("");
    const [sortBy, setSortBy] = useState<string>("name");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [page, setPage] = useState(1);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Default score and duration for the whole clone operation
    const [defaultScore, setDefaultScore] = useState<number>(initialScore);
    const [defaultDuration, setDefaultDuration] = useState<string>(initialDuration);

    // Per-question overrides
    const [durations, setDurations] = useState<Record<string, string>>({});
    const [scores, setScores] = useState<Record<string, string>>({});

    const pageSize = 10;
    const debouncedSearch = useDebounce(search, 500);
    const debouncedTag = useDebounce(tagName, 500);

    const { data: sourceBankData } = useGetBankDetail(sourceBankId);
    const sourceBank = sourceBankData?.data;

    const { data, isLoading, isError, error, refetch } = useGetBankQuestions(
        sourceBankId,
        {
            skip: (page - 1) * pageSize,
            limit: pageSize,
            title: debouncedSearch || undefined,
            tag: debouncedTag || undefined,
            difficulty: difficulty === "ALL" ? undefined : (difficulty as any),
            sort_by: sortBy as any,
            sort_order: sortOrder as any,
        },
        {
            query: {
                placeholderData: keepPreviousData,
            },
        },
    );

    const cloneMutation = useCloneQuestionsFromBank({
        mutation: {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: contestQuestionsKey(contestId) });
                toast.success(`${selectedIds.length} questions cloned to contest successfully!`);
                router.push(`/contest/${contestId}/questions`);
            },
        },
    });

    const questionsResponse = (data as any)?.data;
    const questions = (
        Array.isArray(questionsResponse)
            ? questionsResponse
            : questionsResponse?.items || questionsResponse?.questions || []
    ) as any[];
    const pagination = (data as any)?.pagination;

    const handleSort = (field: string) => {
        const newOrder = sortBy === field && sortOrder === "asc" ? "desc" : "asc";
        setSortBy(field);
        setSortOrder(newOrder);
        setPage(1);
    };

    const handleCloneSelected = async () => {
        if (selectedIds.length === 0) return;

        try {
            await cloneMutation.mutateAsync({
                contestId,
                data: {
                    bank_id: sourceBankId,
                    copy_all: false,
                    questions: selectedIds.map((id) => ({
                        question_id: id,
                        score: scores[id] ? parseInt(scores[id]) : null,
                        duration: durations[id] ? parseInt(durations[id]) : null,
                    })),
                    score: defaultScore,
                    duration: defaultDuration ? parseInt(defaultDuration) : null,
                },
            });
        } catch (err) {
            // Error handled globally
        }
    };

    const toggleSelection = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
        );
    };

    const handleDurationChange = (id: string, value: string) => {
        setDurations((prev) => ({ ...prev, [id]: value }));
    };

    const handleScoreChange = (id: string, value: string) => {
        setScores((prev) => ({ ...prev, [id]: value }));
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-primary/5 border border-primary/10 p-8 sm:p-12">
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
                <div className="relative z-10 flex flex-col gap-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-2">
                            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                                Import Questions
                            </h1>
                            <p className="text-lg text-muted-foreground font-medium max-w-2xl">
                                Select questions from{" "}
                                <span className="text-primary font-bold">
                                    {sourceBank?.name || "source bank"}
                                </span>{" "}
                                to clone into your contest.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-4 items-center">
                            <div className="grid gap-1.5">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70 flex items-center gap-2">
                                    <Trophy className="h-3 w-3" /> Default Score
                                </Label>
                                <Input
                                    type="number"
                                    className="h-9 w-24 bg-background/50"
                                    value={defaultScore}
                                    onChange={(e) => setDefaultScore(parseInt(e.target.value) || 0)}
                                />
                            </div>
                            <div className="grid gap-1.5">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70 flex items-center gap-2">
                                    <Timer className="h-3 w-3" /> Default Duration
                                </Label>
                                <Input
                                    type="number"
                                    placeholder="None"
                                    className="h-9 w-24 bg-background/50"
                                    value={defaultDuration}
                                    onChange={(e) => setDefaultDuration(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 items-center pt-4 border-t border-primary/10">
                        <div className="flex items-center gap-2 bg-background/50 backdrop-blur-sm px-4 py-2 rounded-full border border-border/50 text-sm font-semibold">
                            <FileCode2 className="h-4 w-4 text-primary" />
                            <span>{selectedIds.length} Questions Selected</span>
                        </div>
                        <Button
                            onClick={handleCloneSelected}
                            disabled={selectedIds.length === 0 || cloneMutation.isPending}
                            className="rounded-full px-8 shadow-xl shadow-primary/20 gap-2"
                        >
                            {cloneMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Copy className="h-4 w-4" />
                            )}
                            Import Selected
                        </Button>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-4 bg-muted/40 p-4 rounded-xl border border-border/60 backdrop-blur-md">
                    <div className="flex flex-wrap items-center gap-3 flex-1">
                        <div className="relative min-w-[200px] flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                            <Input
                                placeholder="Search bank questions..."
                                className="pl-9 bg-background border-border/60 focus:border-primary/50 transition-colors h-10 shadow-sm"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                            />
                        </div>
                        <div className="relative min-w-[200px] flex-1">
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
                </div>

                {/* Table */}
                <AsyncStateHandler
                    isLoading={isLoading}
                    isError={isError}
                    error={error}
                    onRetry={refetch}
                >
                    <div className="rounded-xl border border-border/60 bg-card/50 backdrop-blur-md overflow-hidden shadow-xl">
                        <div className="grid grid-cols-[48px_1fr_100px_140px_100px_100px] items-center gap-4 px-6 py-4 border-b border-border/60 bg-muted/50 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                            <div className="flex justify-center">
                                <Checkbox
                                    checked={
                                        questions.length > 0 &&
                                        questions.every((q) => selectedIds.includes(q.id))
                                    }
                                    onCheckedChange={(checked) => {
                                        const pageIds = questions.map((q) => q.id);
                                        setSelectedIds((prev) =>
                                            checked
                                                ? Array.from(new Set([...prev, ...pageIds]))
                                                : prev.filter((id) => !pageIds.includes(id)),
                                        );
                                    }}
                                />
                            </div>
                            <div
                                className="flex items-center gap-2 cursor-pointer hover:text-foreground transition-colors"
                                onClick={() => handleSort("name")}
                            >
                                Question Details
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
                                Diff
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
                            <div className="flex items-center gap-2">
                                <Trophy className="h-3 w-3" /> Score
                            </div>
                            <div className="flex items-center gap-2">
                                <Timer className="h-3 w-3" /> Duration
                            </div>
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
                                        className="grid grid-cols-[48px_1fr_100px_140px_100px_100px] items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors group"
                                    >
                                        <div className="flex justify-center">
                                            <Checkbox
                                                checked={selectedIds.includes(question.id)}
                                                onCheckedChange={() => toggleSelection(question.id)}
                                            />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
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
                                                    {question.tags.slice(0, 1).map((tag: any) => (
                                                        <Badge
                                                            key={tag.id}
                                                            variant="secondary"
                                                            className="bg-muted/50 text-[10px] h-5 px-1.5 font-medium"
                                                        >
                                                            {tag.name}
                                                        </Badge>
                                                    ))}
                                                </>
                                            ) : (
                                                <span className="text-[10px] text-muted-foreground/40 font-medium italic">
                                                    -
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <Input
                                                type="number"
                                                placeholder={defaultScore.toString()}
                                                className="h-8 text-xs bg-transparent border-border/40 focus:border-primary/40"
                                                value={scores[question.id] || ""}
                                                onChange={(e) =>
                                                    handleScoreChange(question.id, e.target.value)
                                                }
                                                disabled={!selectedIds.includes(question.id)}
                                            />
                                        </div>
                                        <div>
                                            <Input
                                                type="number"
                                                placeholder={defaultDuration || "Def"}
                                                className="h-8 text-xs bg-transparent border-border/40 focus:border-primary/40"
                                                value={durations[question.id] || ""}
                                                onChange={(e) =>
                                                    handleDurationChange(
                                                        question.id,
                                                        e.target.value,
                                                    )
                                                }
                                                disabled={!selectedIds.includes(question.id)}
                                            />
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
        </div>
    );
}
