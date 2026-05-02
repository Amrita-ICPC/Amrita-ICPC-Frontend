import { redirect } from "next/navigation";

import { ContestDetailClient } from "@/components/contest/contest-detail-client";
import { ContestForm } from "@/components/contest/contest-form";
import AccessDenied from "@/components/global/access-denied";
import AuthGuard from "@/components/global/auth-guard";
import { Roles } from "@/lib/auth/utils";
import { EditContestClient } from "./edit/edit-contest-client";

type SearchParams = Record<string, string | string[] | undefined>;

function isEditMode(edit: string | string[] | undefined) {
    const value = Array.isArray(edit) ? edit[0] : edit;
    return value === "1" || value === "true";
}

export default async function ContestDetailPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams?: Promise<SearchParams>;
}) {
    const [{ id }, resolvedSearchParams] = await Promise.all([params, searchParams]);
    const isNew = id === "new";
    const isEdit = !isNew && isEditMode(resolvedSearchParams?.edit);

    if (isNew || isEdit) {
        return (
            <div className="flex h-full flex-col gap-6 p-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {isNew ? "Create Contest" : "Edit Contest"}
                    </h1>
                    <p className="text-muted-foreground">
                        {isNew
                            ? "Set up contest details, registration, and visibility."
                            : "Modify contest details, schedule, and settings."}
                    </p>
                </div>

                <AuthGuard
                    requiredRoles={[isNew ? Roles.CONTEST_CREATE : Roles.CONTEST_UPDATE]}
                    fallbackComponent={<AccessDenied />}
                >
                    {isNew ? <ContestForm /> : <EditContestClient contestId={id} />}
                </AuthGuard>
            </div>
        );
    }

    return <ContestDetailClient contestId={id} />;
}
