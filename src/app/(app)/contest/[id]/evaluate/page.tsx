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
        <div className="flex h-full flex-col">
            <AuthGuard requiredRoles={[Roles.CONTEST_UPDATE]} fallbackComponent={<AccessDenied />}>
                <div className="flex-1 space-y-4 p-8 pt-6">
                    <ContestEvaluateClient contestId={id} />
                </div>
            </AuthGuard>
        </div>
    );
}
