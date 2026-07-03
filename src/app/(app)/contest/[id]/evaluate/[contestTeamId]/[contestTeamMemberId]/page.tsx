import { MemberDetailClient } from "@/components/contest/team-member-analytics/member-detail-client";
import AccessDenied from "@/components/global/access-denied";
import AuthGuard from "@/components/global/auth-guard";
import { Roles } from "@/lib/auth/utils";

export default async function ContestTeamMemberAnalyticsPage({
    params,
}: {
    params: Promise<{ id: string; contestTeamId: string; contestTeamMemberId: string }>;
}) {
    const { id, contestTeamId, contestTeamMemberId } = await params;

    return (
        <AuthGuard requiredRoles={[Roles.CONTEST_UPDATE]} fallbackComponent={<AccessDenied />}>
            <MemberDetailClient
                contestId={id}
                contestTeamId={contestTeamId}
                contestTeamMemberId={contestTeamMemberId}
            />
        </AuthGuard>
    );
}
