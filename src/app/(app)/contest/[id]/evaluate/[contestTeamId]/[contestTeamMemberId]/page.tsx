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
        <div className="flex h-full flex-col">
            <AuthGuard requiredRoles={[Roles.CONTEST_UPDATE]} fallbackComponent={<AccessDenied />}>
                <div className="flex-1 space-y-6 p-8 pt-6">
                    <MemberDetailClient
                        contestId={id}
                        contestTeamId={contestTeamId}
                        contestTeamMemberId={contestTeamMemberId}
                    />
                </div>
            </AuthGuard>
        </div>
    );
}
