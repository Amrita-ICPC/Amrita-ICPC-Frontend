"use client";

import { useState } from "react";
import {
    useGetContestApiV1ContestsContestIdGet,
    useGetContestQuestionsApiV1ContestsContestIdQuestionsGet,
} from "@/api/generated/contests/contests";
import { keepPreviousData } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { ContestQuestionsHero } from "./contest-questions-hero";
import { ContestQuestionsStats } from "./contest-questions-stats";
import { ContestQuestionsTable } from "./contest-questions-table";

interface ContestQuestionsClientProps {
    contestId: string;
}

import { AsyncStateHandler } from "../shared/async-state-handler";

export function ContestQuestionsClient({ contestId }: ContestQuestionsClientProps) {
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
            page_size: 10,
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
            <div className="space-y-8">
                <ContestQuestionsHero contestId={contestId} contestName={contest?.name} />

                <ContestQuestionsStats
                    total={questionsResponse?.total_count ?? 0}
                    easy={questionsResponse?.easy_count ?? 0}
                    medium={questionsResponse?.medium_count ?? 0}
                    hard={questionsResponse?.hard_count ?? 0}
                />

                <ContestQuestionsTable
                    contestId={contestId}
                    questions={questions}
                    pagination={pagination ?? undefined}
                    isLoading={isQuestionsLoading || isFetching}
                    onPageChange={setPage}
                    onSearchChange={(val) => {
                        setSearch(val);
                        setPage(1);
                    }}
                    onDifficultyChange={(val) => {
                        setDifficulty(val);
                        setPage(1);
                    }}
                    onTagChange={(val) => {
                        setTagName(val);
                        setPage(1);
                    }}
                    onSortChange={(field, order) => {
                        setSortBy(field);
                        setSortOrder(order);
                        setPage(1);
                    }}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                />
            </div>
        </AsyncStateHandler>
    );
}
