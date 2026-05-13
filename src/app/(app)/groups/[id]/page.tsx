import AccessDenied from "@/components/global/access-denied";
import { GroupDetailClient } from "@/components/groups/group-detail-client";
import { auth } from "@/lib/auth/auth";
import { isAdmin } from "@/lib/auth/guards";

export default async function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const [session, resolvedParams] = await Promise.all([auth(), params]);

    if (!isAdmin(session?.user)) {
        return <AccessDenied />;
    }

    return <GroupDetailClient groupId={resolvedParams.id} />;
}
