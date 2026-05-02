"use client";

import { useGetContestApiV1ContestsContestIdGet } from "@/api/generated/contests/contests";
import { ContestForm } from "@/components/contest/contest-form";

interface EditContestClientProps {
    contestId: string;
}

import { AsyncStateHandler } from "@/components/shared/async-state-handler";

export function EditContestClient({ contestId }: EditContestClientProps) {
    const { data, isLoading, isError, error, refetch } =
        useGetContestApiV1ContestsContestIdGet(contestId);

    return (
        <AsyncStateHandler
            isLoading={isLoading}
            isError={isError || (!isLoading && !data?.data)}
            error={error}
            onRetry={refetch}
            errorTitle="Failed to Load Contest"
        >
            {data?.data && <ContestForm initialData={data.data} contestId={contestId} />}
        </AsyncStateHandler>
    );
}
