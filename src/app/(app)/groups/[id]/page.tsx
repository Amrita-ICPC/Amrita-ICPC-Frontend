import AuthGuard from "@/components/global/auth-guard";
import { GroupDetailClient } from "@/components/groups/group-detail-client";
import { UserType } from "@/lib/auth/utils";

export default async function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const [resolvedParams] = await Promise.all([params]);

    return (
        <AuthGuard requiredGroups={[UserType.ADMIN]}>
            <GroupDetailClient groupId={resolvedParams.id} />
        </AuthGuard>
    );
}
