"use client";

import { useState } from "react";
import {
    useGetContestApiV1ContestsContestIdGet,
    useGetContestQuestionsApiV1ContestsContestIdQuestionsGet,
} from "@/api/generated/contests/contests";
import { Skeleton } from "@/components/ui/skeleton";
import { ContestQuestionsHero } from "./contest-questions-hero";
import { ContestQuestionsStats } from "./contest-questions-stats";
import { ContestQuestionsTable } from "./contest-questions-table";

interface ContestQuestionsClientProps {
    contestId: string;
}

export function ContestQuestionsClient({ contestId }: ContestQuestionsClientProps) {
    const [search, setSearch] = useState("");
    const [difficulty, setDifficulty] = useState<string>("ALL");
    const [page, setPage] = useState(1);

    const { data: contestData } = useGetContestApiV1ContestsContestIdGet(contestId);
    const { data: questionsData, isLoading } =
        useGetContestQuestionsApiV1ContestsContestIdQuestionsGet(contestId, {
            page,
            page_size: 10,
            search: search || undefined,
            difficulty: difficulty === "ALL" ? undefined : (difficulty as any),
        });

    const contest = contestData?.data;
    const questionsResponse = questionsData?.data;
    const questions = questionsResponse?.questions ?? [];
    const pagination = questionsData?.pagination;

    if (isLoading && page === 1) {
        return (
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
        );
    }

    return (
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
                isLoading={isLoading}
                onPageChange={setPage}
                onSearchChange={(val) => {
                    setSearch(val);
                    setPage(1);
                }}
                onDifficultyChange={(val) => {
                    setDifficulty(val);
                    setPage(1);
                }}
            />
        </div>
    );
}
