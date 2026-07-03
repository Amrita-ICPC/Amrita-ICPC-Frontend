import { ContestEvaluateClient } from "@/components/contest/contest-evaluate-client";
import AccessDenied from "@/components/global/access-denied";
import AuthGuard from "@/components/global/auth-guard";
import { Roles } from "@/lib/auth/utils";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function ContestEvaluatePage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams?: Promise<SearchParams>;
}) {
    const [{ id }] = await Promise.all([params, searchParams]);

    return (
        <AuthGuard requiredRoles={[Roles.CONTEST_UPDATE]} fallbackComponent={<AccessDenied />}>
            <ContestEvaluateClient contestId={id} />
        </AuthGuard>
    );
}
