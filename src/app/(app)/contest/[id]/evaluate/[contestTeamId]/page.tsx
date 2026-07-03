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
        <AuthGuard requiredRoles={[Roles.CONTEST_UPDATE]} fallbackComponent={<AccessDenied />}>
            <TeamAnalyticsClient contestId={id} contestTeamId={contestTeamId} />
        </AuthGuard>
    );
}
