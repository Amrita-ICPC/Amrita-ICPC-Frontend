"use client";

import { keepPreviousData, useQueryClient } from "@tanstack/react-query";
import {
    BookOpen,
    Check,
    ChevronLeft,
    FileQuestion,
    Loader2,
    Search,
    Tag,
    Timer,
    Trophy,
    X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { getBankQuestionsApiV1BanksBankIdQuestionsGet } from "@/api/generated/bank-questions/bank-questions";
import type { BankResponse, QuestionListSummaryResponse } from "@/api/generated/model";
import { AppPagination } from "@/components/shared/app-pagination";
import { AsyncStateHandler } from "@/components/shared/async-state-handler";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import {
    bankQuestionsKey,
    useCloneBankQuestions,
    useGetAllBanks,
    useGetBankQuestions,
} from "@/query/bank-query";
import { contestQuestionsKey, useCloneQuestionsFromBank } from "@/query/contest-query";

type Destination = "bank" | "contest";
type SelectedQuestion = Pick<
    QuestionListSummaryResponse,
    "id" | "title" | "difficulty" | "tags"
> & {
    bankId: string;
    bankName: string;
};

interface QuestionImportClientProps {
    targetId: string;
    destination: Destination;
}

const difficultyStyles: Record<string, string> = {
    EASY: "border-transparent bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    MEDIUM: "border-transparent bg-amber-500/10 text-amber-600 dark:text-amber-400",
    HARD: "border-transparent bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

export function QuestionImportClient({ targetId, destination }: QuestionImportClientProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [activeBankId, setActiveBankId] = useState("");
    const [bankSearch, setBankSearch] = useState("");
    const [search, setSearch] = useState("");
    const [topic, setTopic] = useState("");
    const [difficulty, setDifficulty] = useState<string[]>([]);
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState<Record<string, SelectedQuestion>>({});
    const [defaultScore, setDefaultScore] = useState(100);
    const [defaultDuration, setDefaultDuration] = useState("");
    const [isImporting, setIsImporting] = useState(false);
    const [isSelectingAll, setIsSelectingAll] = useState(false);
    const pageSize = 10;

    const debouncedSearch = useDebounce(search, 400);
    const debouncedTopic = useDebounce(topic, 400);
    const { data: banksData, isLoading: banksLoading } = useGetAllBanks({ page_size: 100 });
    const banks = useMemo(
        () =>
            ((banksData?.data ?? []) as BankResponse[]).filter(
                (bank) => destination === "contest" || bank.id !== targetId,
            ),
        [banksData?.data, destination, targetId],
    );
    const visibleBanks = banks.filter((bank) =>
        bank.name.toLowerCase().includes(bankSearch.toLowerCase()),
    );
    const activeBank = banks.find((bank) => bank.id === activeBankId);

    const { data, isLoading, isError, error, refetch } = useGetBankQuestions(
        activeBankId,
        {
            skip: (page - 1) * pageSize,
            limit: pageSize,
            title: debouncedSearch || undefined,
            tag: debouncedTopic || undefined,
            difficulty: difficulty.length === 1 ? (difficulty[0] as never) : undefined,
            sort_by: "name",
            sort_order: "asc",
        },
        { query: { enabled: Boolean(activeBankId), placeholderData: keepPreviousData } },
    );
    const response = (data as { data?: unknown })?.data as
        | QuestionListSummaryResponse[]
        | { items?: QuestionListSummaryResponse[]; questions?: QuestionListSummaryResponse[] }
        | undefined;
    const allQuestions = Array.isArray(response)
        ? response
        : response?.items || response?.questions || [];
    const questions =
        difficulty.length > 1
            ? allQuestions.filter((question) => difficulty.includes(question.difficulty))
            : allQuestions;
    const pagination = (data as any)?.pagination;

    const bankMutation = useCloneBankQuestions();
    const contestMutation = useCloneQuestionsFromBank();
    const selectedQuestions = Object.values(selected);
    const selectedByBank = selectedQuestions.reduce<Record<string, SelectedQuestion[]>>(
        (groups, question) => {
            (groups[question.bankId] ||= []).push(question);
            return groups;
        },
        {},
    );

    const chooseBank = (bankId: string) => {
        setActiveBankId(bankId);
        setPage(1);
    };

    const toggleQuestion = (question: QuestionListSummaryResponse) => {
        if (!activeBank) return;
        setSelected((current) => {
            const next = { ...current };
            if (next[question.id]) delete next[question.id];
            else
                next[question.id] = {
                    id: question.id,
                    title: question.title,
                    difficulty: question.difficulty,
                    tags: question.tags,
                    bankId: activeBank.id,
                    bankName: activeBank.name,
                };
            return next;
        });
    };

    const selectAllInBank = async () => {
        if (!activeBank) return;
        setIsSelectingAll(true);
        const bank = activeBank;
        try {
            const limit = 100;
            const maxResults = 1000;
            const collected: QuestionListSummaryResponse[] = [];
            let skip = 0;
            for (;;) {
                const res = await getBankQuestionsApiV1BanksBankIdQuestionsGet(bank.id, {
                    skip,
                    limit,
                    title: debouncedSearch || undefined,
                    tag: debouncedTopic || undefined,
                    difficulty: difficulty.length === 1 ? (difficulty[0] as never) : undefined,
                    sort_by: "name",
                    sort_order: "asc",
                });
                const body = (res as { data?: unknown })?.data as
                    | QuestionListSummaryResponse[]
                    | {
                          items?: QuestionListSummaryResponse[];
                          questions?: QuestionListSummaryResponse[];
                      }
                    | undefined;
                const batch = Array.isArray(body) ? body : body?.items || body?.questions || [];
                collected.push(
                    ...(difficulty.length > 1
                        ? batch.filter((question) => difficulty.includes(question.difficulty))
                        : batch),
                );
                if (batch.length < limit || collected.length >= maxResults) break;
                skip += limit;
            }
            setSelected((current) => {
                const next = { ...current };
                for (const question of collected) {
                    next[question.id] = { ...question, bankId: bank.id, bankName: bank.name };
                }
                return next;
            });
            toast.success(`${collected.length} questions selected from ${bank.name}`);
        } catch {
            toast.error("Failed to select all matching questions from this bank");
        } finally {
            setIsSelectingAll(false);
        }
    };

    const deselectAllInBank = () => {
        if (!activeBank) return;
        const bank = activeBank;
        setSelected((current) => {
            const next = { ...current };
            for (const id of Object.keys(next)) {
                if (next[id].bankId === bank.id) delete next[id];
            }
            return next;
        });
    };

    const clearAllSelected = () => setSelected({});

    const importSelected = async () => {
        if (!selectedQuestions.length) return;
        setIsImporting(true);
        try {
            for (const [bankId, bankQuestions] of Object.entries(selectedByBank)) {
                if (destination === "bank") {
                    await bankMutation.mutateAsync({
                        sourceBankId: bankId,
                        data: {
                            target_bank_id: targetId,
                            copy_all: false,
                            question_ids: bankQuestions.map((question) => question.id),
                        },
                    });
                } else {
                    await contestMutation.mutateAsync({
                        contestId: targetId,
                        data: {
                            bank_id: bankId,
                            copy_all: false,
                            questions: bankQuestions.map((question) => ({
                                question_id: question.id,
                            })),
                            score: defaultScore,
                            duration: defaultDuration ? Number(defaultDuration) : null,
                        },
                    });
                }
            }
            await queryClient.invalidateQueries({
                queryKey:
                    destination === "bank"
                        ? bankQuestionsKey(targetId)
                        : contestQuestionsKey(targetId),
            });
            toast.success(
                `${selectedQuestions.length} questions imported from ${Object.keys(selectedByBank).length} banks`,
            );
            router.push(destination === "bank" ? `/banks/${targetId}` : `/contest/${targetId}`);
        } catch {
            toast.error("Some questions could not be imported. Please try again.");
        } finally {
            setIsImporting(false);
        }
    };

    const backHref = destination === "bank" ? `/banks/${targetId}` : `/contest/${targetId}`;

    return (
        <div className="flex min-h-[calc(100vh-8rem)] flex-col gap-4">
            <Card className="border-border/60 py-0">
                <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="-ml-2 mb-1 text-muted-foreground"
                        >
                            <Link href={backHref}>
                                <ChevronLeft /> Back
                            </Link>
                        </Button>
                        <div className="flex items-center gap-3">
                            <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <BookOpen />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">
                                    Import questions from banks
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    Browse multiple banks and build one import selection.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-end gap-3">
                        {destination === "contest" && (
                            <>
                                <div className="grid gap-1">
                                    <Label className="text-xs">
                                        <Trophy className="mr-1 inline size-3" />
                                        Default score
                                    </Label>
                                    <Input
                                        className="w-28"
                                        type="number"
                                        min={1}
                                        value={defaultScore}
                                        onChange={(e) =>
                                            setDefaultScore(Number(e.target.value) || 1)
                                        }
                                    />
                                </div>
                                <div className="grid gap-1">
                                    <Label className="text-xs">
                                        <Timer className="mr-1 inline size-3" />
                                        Duration (sec)
                                    </Label>
                                    <Input
                                        className="w-32"
                                        type="number"
                                        min={0}
                                        placeholder="Optional"
                                        value={defaultDuration}
                                        onChange={(e) => setDefaultDuration(e.target.value)}
                                    />
                                </div>
                            </>
                        )}
                        <Badge variant="secondary" className="h-9 px-3">
                            {selectedQuestions.length} selected
                        </Badge>
                        <Button
                            onClick={importSelected}
                            disabled={!selectedQuestions.length || isImporting}
                        >
                            {isImporting ? <Loader2 className="animate-spin" /> : <Check />}
                            Import questions
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[280px_minmax(0,1fr)_280px]">
                <Card className="min-h-0 border-border/60 py-0">
                    <CardContent className="flex h-full flex-col gap-3 p-4">
                        <div>
                            <h2 className="font-semibold">Question banks</h2>
                            <p className="text-xs text-muted-foreground">
                                Selections stay saved as you switch.
                            </p>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={bankSearch}
                                onChange={(e) => setBankSearch(e.target.value)}
                                placeholder="Search banks"
                                className="pl-9"
                            />
                        </div>
                        <ScrollArea className="h-[560px] pr-2">
                            <div className="space-y-2">
                                {banksLoading ? (
                                    <div className="p-6 text-center text-sm text-muted-foreground">
                                        Loading banks…
                                    </div>
                                ) : (
                                    visibleBanks.map((bank) => {
                                        const count = selectedByBank[bank.id]?.length ?? 0;
                                        return (
                                            <button
                                                key={bank.id}
                                                type="button"
                                                onClick={() => chooseBank(bank.id)}
                                                className={cn(
                                                    "w-full rounded-lg border p-3 text-left transition-colors",
                                                    activeBankId === bank.id
                                                        ? "border-primary/40 bg-primary/10"
                                                        : "border-border/60 hover:bg-muted/40",
                                                )}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <span className="line-clamp-2 text-sm font-medium">
                                                        {bank.name}
                                                    </span>
                                                    {count > 0 && (
                                                        <Badge className="shrink-0">{count}</Badge>
                                                    )}
                                                </div>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {bank.total_questions_count ?? 0} questions
                                                </p>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                <Card className="min-w-0 border-border/60 py-0">
                    <CardContent className="flex flex-col gap-4 p-4">
                        {!activeBank ? (
                            <EmptyState
                                className="min-h-[560px]"
                                icon={BookOpen}
                                title="Choose a question bank"
                                description="Select a bank on the left to browse its questions."
                            />
                        ) : (
                            <>
                                <div className="flex flex-col gap-3 border-b border-border/60 pb-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="font-semibold">{activeBank.name}</h2>
                                            <p className="text-xs text-muted-foreground">
                                                <span className="font-semibold text-foreground">
                                                    {pagination?.total ?? questions.length}
                                                </span>{" "}
                                                available
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={deselectAllInBank}
                                                disabled={!selectedByBank[activeBank.id]?.length}
                                            >
                                                <X />
                                                Deselect all
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={selectAllInBank}
                                                disabled={isSelectingAll || !questions.length}
                                            >
                                                {isSelectingAll ? (
                                                    <Loader2 className="animate-spin" />
                                                ) : (
                                                    <Check />
                                                )}
                                                Select all
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="grid gap-2 md:grid-cols-2">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                value={search}
                                                onChange={(e) => {
                                                    setSearch(e.target.value);
                                                    setPage(1);
                                                }}
                                                placeholder="Search questions"
                                                className="pl-9"
                                            />
                                        </div>
                                        <div className="relative">
                                            <Tag className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                value={topic}
                                                onChange={(e) => {
                                                    setTopic(e.target.value);
                                                    setPage(1);
                                                }}
                                                placeholder="Search topics"
                                                className="pl-9"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {["EASY", "MEDIUM", "HARD"].map((level) => (
                                            <Button
                                                key={level}
                                                type="button"
                                                size="sm"
                                                variant={
                                                    difficulty.includes(level)
                                                        ? "default"
                                                        : "outline"
                                                }
                                                onClick={() => {
                                                    setDifficulty((current) =>
                                                        current.includes(level)
                                                            ? current.filter(
                                                                  (item) => item !== level,
                                                              )
                                                            : [...current, level],
                                                    );
                                                    setPage(1);
                                                }}
                                            >
                                                {level[0] + level.slice(1).toLowerCase()}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                                <AsyncStateHandler
                                    isLoading={isLoading}
                                    isError={isError}
                                    error={error}
                                    onRetry={refetch}
                                >
                                    <div className="space-y-3">
                                        {questions.map((question) => (
                                            <button
                                                key={question.id}
                                                type="button"
                                                onClick={() => toggleQuestion(question)}
                                                className={cn(
                                                    "flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-all",
                                                    selected[question.id]
                                                        ? "border-primary/50 bg-primary/5 shadow-sm"
                                                        : "border-border/60 hover:border-primary/30 hover:bg-muted/30",
                                                )}
                                            >
                                                <Checkbox
                                                    checked={Boolean(selected[question.id])}
                                                    className="mt-0.5"
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-medium leading-snug">
                                                        {question.title}
                                                    </p>
                                                    <div className="mt-2 flex flex-wrap items-center gap-2">
                                                        <Badge
                                                            variant="outline"
                                                            className={
                                                                difficultyStyles[
                                                                    question.difficulty
                                                                ]
                                                            }
                                                        >
                                                            {question.difficulty}
                                                        </Badge>
                                                        {question.tags?.slice(0, 3).map((tag) => (
                                                            <Badge
                                                                key={tag.id}
                                                                variant="secondary"
                                                                className="font-normal"
                                                            >
                                                                {tag.name}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                        {!questions.length && (
                                            <EmptyState
                                                icon={FileQuestion}
                                                title="No questions match these filters"
                                                description="Try changing the search, difficulty, or tag filters."
                                                compact
                                            />
                                        )}
                                    </div>
                                </AsyncStateHandler>
                                {pagination && (
                                    <div className="flex justify-end border-t pt-4">
                                        <AppPagination
                                            currentPage={pagination.page}
                                            totalPages={pagination.total_pages}
                                            hasNext={pagination.has_next}
                                            hasPrevious={pagination.has_previous}
                                            onPageChange={setPage}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card className="min-h-0 border-border/60 py-0">
                    <CardContent className="flex h-full flex-col gap-3 p-4">
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <h2 className="font-semibold">Import selection</h2>
                                <p className="text-xs text-muted-foreground">
                                    {Object.keys(selectedByBank).length} banks ·{" "}
                                    {selectedQuestions.length} questions
                                </p>
                            </div>
                            {selectedQuestions.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="shrink-0 text-muted-foreground"
                                    onClick={clearAllSelected}
                                >
                                    Clear all
                                </Button>
                            )}
                        </div>
                        <ScrollArea className="h-[560px] pr-2">
                            {!selectedQuestions.length ? (
                                <div className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 text-center text-muted-foreground">
                                    <FileQuestion className="size-8 opacity-50" />
                                    <p className="text-sm">Selected questions will appear here.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {Object.entries(selectedByBank).map(([bankId, items]) => (
                                        <div key={bankId}>
                                            <div className="mb-2 flex items-center justify-between">
                                                <p className="truncate text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                    {items[0].bankName}
                                                </p>
                                                <Badge variant="secondary">{items.length}</Badge>
                                            </div>
                                            <div className="space-y-2">
                                                {items.map((question) => (
                                                    <div
                                                        key={question.id}
                                                        className="flex items-start gap-2 rounded-lg bg-muted/40 p-2.5"
                                                    >
                                                        <p className="line-clamp-2 flex-1 text-xs font-medium">
                                                            {question.title}
                                                        </p>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="size-6 shrink-0"
                                                            onClick={() =>
                                                                setSelected((current) => {
                                                                    const next = { ...current };
                                                                    delete next[question.id];
                                                                    return next;
                                                                })
                                                            }
                                                            aria-label={`Remove ${question.title}`}
                                                        >
                                                            <X className="size-3.5" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
