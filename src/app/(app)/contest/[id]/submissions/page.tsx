import { ContestSubmissionsClient } from "@/components/contest/submissions/contest-submissions-client";
import AccessDenied from "@/components/global/access-denied";
import AuthGuard from "@/components/global/auth-guard";
import { Roles } from "@/lib/auth/utils";

export default async function ContestSubmissionsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    return (
        <div className="flex h-full flex-col">
            <AuthGuard requiredRoles={[Roles.CONTEST_UPDATE]} fallbackComponent={<AccessDenied />}>
                <div className="flex-1 space-y-4 p-8 pt-6">
                    <ContestSubmissionsClient contestId={id} />
                </div>
            </AuthGuard>
        </div>
    );
}
