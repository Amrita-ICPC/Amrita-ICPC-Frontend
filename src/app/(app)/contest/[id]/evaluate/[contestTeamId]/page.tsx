import { TeamAnalyticsClient } from "@/components/contest/team-analytics-client";
import AccessDenied from "@/components/global/access-denied";
import AuthGuard from "@/components/global/auth-guard";
import { Roles } from "@/lib/auth/utils";

export default async function ContestTeamAnalyticsPage({
    params,
}: {
    params: Promise<{ id: string; contestTeamId: string }>;
}) {
    const { id, contestTeamId } = await params;

    return (
        <div className="flex h-full flex-col">
            <AuthGuard requiredRoles={[Roles.CONTEST_UPDATE]} fallbackComponent={<AccessDenied />}>
                <div className="flex-1 space-y-6 p-8 pt-6">
                    <TeamAnalyticsClient contestId={id} contestTeamId={contestTeamId} />
                </div>
            </AuthGuard>
        </div>
    );
}
