import type { Session } from "next-auth";

import AccessDenied from "@/components/global/access-denied";
import { GroupDetailClient } from "@/components/groups/group-detail-client";
import { auth } from "@/lib/auth/auth";
import { UserType } from "@/lib/auth/utils";

function isAdmin(user?: Session["user"] | null) {
    const claims = [...(user?.roles ?? []), ...(user?.groups ?? [])];
    return claims.some((claim) => claim.toLowerCase() === UserType.ADMIN);
}

export default async function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const [session, resolvedParams] = await Promise.all([auth(), params]);

    if (!isAdmin(session?.user)) {
        return <AccessDenied />;
    }

    return <GroupDetailClient groupId={resolvedParams.id} />;
}
