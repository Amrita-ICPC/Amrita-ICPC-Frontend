"use client";

import { useGetContestApiV1ContestsContestIdGet } from "@/api/generated/contests/contests";
import { ContestForm } from "@/components/contest/contest-form";
import { Loader2, AlertCircle } from "lucide-react";

interface EditContestClientProps {
    contestId: string;
}

export function EditContestClient({ contestId }: EditContestClientProps) {
    const { data, isLoading, isError } = useGetContestApiV1ContestsContestIdGet(contestId);

    if (isLoading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (isError || !data?.data) {
        return (
            <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-center">
                <AlertCircle className="h-10 w-10 text-destructive" />
                <p className="font-medium">Failed to load contest</p>
            </div>
        );
    }

    return <ContestForm initialData={data.data} contestId={contestId} />;
}
