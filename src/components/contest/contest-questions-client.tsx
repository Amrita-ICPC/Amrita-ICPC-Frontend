"use client";

import { keepPreviousData } from "@tanstack/react-query";
import { Library, Plus } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";

import {
    useGetContestApiV1ContestsContestIdGet,
    useGetContestQuestionsApiV1ContestsContestIdQuestionsGet,
} from "@/api/generated/contests/contests";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { BankCloneDialog } from "../banks/bank-clone-dialog";
import { AsyncStateHandler } from "../shared/async-state-handler";
import { ContestQuestionsHero } from "./contest-questions-hero";
import { ContestQuestionsTable } from "./contest-questions-table";

interface ContestQuestionsClientProps {
    contestId: string;
    embedded?: boolean;
}

export function ContestQuestionsClient({
    contestId,
    embedded = false,
}: ContestQuestionsClientProps) {
    const [search, setSearch] = useState("");
    const [difficulty, setDifficulty] = useState<string>("ALL");
    const [tagName, setTagName] = useState("");
    const [sortBy, setSortBy] = useState("order");
    const [sortOrder, setSortOrder] = useState("asc");
    const [page, setPage] = useState(1);

    const {
        data: contestData,
        isLoading: isContestLoading,
        isError: isContestError,
        error: contestError,
        refetch: refetchContest,
    } = useGetContestApiV1ContestsContestIdGet(contestId);

    const {
        data: questionsData,
        isLoading: isQuestionsLoading,
        isFetching,
        isError: isQuestionsError,
        error: questionsError,
        refetch: refetchQuestions,
    } = useGetContestQuestionsApiV1ContestsContestIdQuestionsGet(
        contestId,
        {
            page,
            page_size: embedded ? 100 : 10,
            search: search || undefined,
            difficulty: difficulty === "ALL" ? undefined : (difficulty as any),
            tag_name: tagName || undefined,
            sort_by: sortBy === "order" ? undefined : sortBy,
            sort_order: sortOrder as any,
        },
        {
            query: {
                placeholderData: keepPreviousData,
            },
        },
    );

    const contest = contestData?.data;
    const questionsResponse = questionsData?.data;
    const questions = questionsResponse?.questions ?? [];
    const pagination = questionsData?.pagination;

    const handlePageChange = useCallback((newPage: number) => {
        setPage(newPage);
    }, []);

    const handleSearchChange = useCallback((val: string) => {
        setSearch(val);
        setPage(1);
    }, []);

    const handleDifficultyChange = useCallback((val: string) => {
        setDifficulty(val);
        setPage(1);
    }, []);

    const handleTagChange = useCallback((val: string) => {
        setTagName(val);
        setPage(1);
    }, []);

    const handleSortChange = useCallback((field: string, order: string) => {
        setSortBy(field);
        setSortOrder(order);
        setPage(1);
    }, []);

    return (
        <AsyncStateHandler
            isLoading={isContestLoading || (isQuestionsLoading && !questionsData)}
            isError={isContestError || isQuestionsError}
            error={contestError || questionsError}
            onRetry={() => {
                if (isContestError) refetchContest();
                if (isQuestionsError) refetchQuestions();
            }}
            loadingComponent={
                <div className="space-y-8">
                    <Skeleton className="h-[200px] w-full rounded-2xl" />
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-24 rounded-xl" />
                        ))}
                    </div>
                    <div className="space-y-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className="h-16 w-full rounded-lg" />
                        ))}
                    </div>
                </div>
            }
        >
            <div
                className={
                    embedded
                        ? "flex flex-col bg-transparent"
                        : "flex min-h-screen flex-col bg-background"
                }
            >
                {!embedded && (
                    <ContestQuestionsHero
                        contestId={contestId}
                        contestName={contest?.name}
                        stats={{
                            total: questionsResponse?.total_count ?? 0,
                            easy: questionsResponse?.easy_count ?? 0,
                            medium: questionsResponse?.medium_count ?? 0,
                            hard: questionsResponse?.hard_count ?? 0,
                        }}
                    />
                )}

                {embedded && (
                    <div className="flex flex-col gap-4 border-b border-border/60 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-foreground">Contest Questions</h3>
                            <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                                {questionsResponse?.total_count ?? 0} questions
                            </span>
                            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                Easy {questionsResponse?.easy_count ?? 0}
                            </span>
                            <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                                Medium {questionsResponse?.medium_count ?? 0}
                            </span>
                            <span className="rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400">
                                Hard {questionsResponse?.hard_count ?? 0}
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <Button size="sm" asChild>
                                <Link href={`/contest/${contestId}/questions/new`}>
                                    <Plus className="size-4" />
                                    New Question
                                </Link>
                            </Button>
                            <BankCloneDialog targetId={contestId} targetType="contest">
                                <Button size="sm" variant="outline">
                                    <Library className="size-4" />
                                    From Bank
                                </Button>
                            </BankCloneDialog>
                        </div>
                    </div>
                )}

                <ContestQuestionsTable
                    contestId={contestId}
                    questions={questions}
                    pagination={pagination ?? undefined}
                    isLoading={isQuestionsLoading || isFetching}
                    onPageChange={handlePageChange}
                    onSearchChange={handleSearchChange}
                    onDifficultyChange={handleDifficultyChange}
                    onTagChange={handleTagChange}
                    onSortChange={handleSortChange}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    embedded={embedded}
                />
            </div>
        </AsyncStateHandler>
    );
}
