"use client";

import { useRouter } from "next/navigation";
import { ContestForm } from "@/components/contest/contest-form";
import { useCreateContest } from "@/mutation/contest-mutation";
import { ContestFormValues } from "@/components/contest/form/contest-form";
import { ContestCreate, ContestMode } from "@/api/generated/model";
import { toast } from "@/lib/hooks/use-toast";
import { toApiError } from "@/lib/api/error";

function toUtcIsoString(dateTimeLocal: string) {
    if (!dateTimeLocal) return null;
    return new Date(dateTimeLocal).toISOString();
}

export function CreateContestClient() {
    const router = useRouter();
    const createContestMutation = useCreateContest();

    const handleSubmit = async (values: ContestFormValues) => {
        const payload: ContestCreate = {
            name: values.name,
            description: values.description?.trim() ? values.description.trim() : null,
            image: values.image ?? null,
            is_public: values.is_public,
            start_time: toUtcIsoString(values.start_time)!,
            end_time: toUtcIsoString(values.end_time)!,
            registration_start: values.registration_start?.trim()
                ? toUtcIsoString(values.registration_start)
                : null,
            registration_end: values.registration_end?.trim()
                ? toUtcIsoString(values.registration_end)
                : null,
            contest_mode: values.contest_mode as ContestMode,
            max_teams: Number.isFinite(values.max_teams ?? NaN) ? values.max_teams! : null,
            min_team_size: values.min_team_size,
            max_team_size: values.max_team_size,
            rules: values.rules?.trim() ? values.rules.trim() : null,
            scoring_type: values.scoring_type,
            team_approval_mode: values.team_approval_mode,
            audience_ids: values.audience_ids?.length ? values.audience_ids : [],
        };

        try {
            await createContestMutation.mutateAsync(payload);
            toast.success("Contest created");
            router.push("/contest");
            router.refresh();
        } catch (error) {
            const apiError = toApiError(error);
            toast.error(apiError.message);
        }
    };

    return (
        <div className="p-4 sm:p-6 md:p-8">
            <ContestForm onSubmit={handleSubmit} isPending={createContestMutation.isPending} />
        </div>
    );
}
