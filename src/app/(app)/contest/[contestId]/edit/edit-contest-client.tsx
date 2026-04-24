"use client";

import { useRouter } from "next/navigation";
import { ContestForm } from "@/components/contest/contest-form";
import { useContestAudiences, useContestDetail, useUpdateContest } from "@/query/contest-query";
import { ContestFormValues } from "@/components/contest/form/contest-form";
import { ContestUpdate, ContestMode } from "@/api/generated/model";
import { toast } from "@/lib/hooks/use-toast";
import { toApiError } from "@/lib/api/error";

function toUtcIsoString(dateTimeLocal: string) {
    if (!dateTimeLocal) return null;
    return new Date(dateTimeLocal).toISOString();
}

type EditContestClientProps = {
    contestId: string;
};

export function EditContestClient({ contestId }: EditContestClientProps) {
    const router = useRouter();
    const { data: contest, isLoading: isContestLoading } = useContestDetail(contestId);
    const { data: audiences, isLoading: isAudiencesLoading } = useContestAudiences(contestId);
    const updateContestMutation = useUpdateContest();

    const handleSubmit = async (values: ContestFormValues) => {
        const payload: ContestUpdate = {
            name: values.name,
            description: values.description?.trim() ? values.description.trim() : null,
            image: values.image ?? null,
            is_public: values.is_public,
            start_time: toUtcIsoString(values.start_time)!,
            end_time: toUtcIsoString(values.end_time)!,
            registration_start: toUtcIsoString(values.registration_start!),
            registration_end: toUtcIsoString(values.registration_end!),
            mode: values.mode,
            max_teams: Number.isFinite(values.max_teams ?? NaN) ? values.max_teams! : null,
            min_team_size: values.min_team_size,
            max_team_size: values.max_team_size,
            rules: values.rules?.trim() ? values.rules.trim() : null,
            scoring_type: values.scoring_type,
            team_approval_mode: values.team_approval_mode,
            audience_ids: values.audience_ids?.length ? values.audience_ids : [],
        };

        try {
            await updateContestMutation.mutateAsync({ contestId, contestData: payload });
            toast.success("Contest updated successfully");
            router.push(`/contest/${contestId}`);
        } catch (error) {
            const apiError = toApiError(error);
            toast.error(apiError.message);
        }
    };

    if (isContestLoading || isAudiencesLoading) {
        return <div>Loading...</div>;
    }

    const audience_ids = audiences?.map((audience) => audience.id) || [];

    return (
        <div className="p-4 sm:p-6 md:p-8">
            <ContestForm
                onSubmit={handleSubmit}
                contest={contest}
                audience_ids={audience_ids}
                isPending={updateContestMutation.isPending}
            />
        </div>
    );
}
