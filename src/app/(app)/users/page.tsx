import type { Session } from "next-auth";

import AccessDenied from "@/components/global/access-denied";
import { UsersClient } from "@/components/users/users-client";
import { auth } from "@/lib/auth/auth";
import { UserType } from "@/lib/auth/utils";

function isAdmin(user?: Session["user"] | null) {
    const claims = [...(user?.roles ?? []), ...(user?.groups ?? [])];
    return claims.some((claim) => claim.toLowerCase() === UserType.ADMIN);
}

export default async function UsersPage() {
    const session = await auth();

    if (!isAdmin(session?.user)) {
        return <AccessDenied />;
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Users</h1>
                    <p className="text-sm text-muted-foreground">
                        Search, filter, and sync platform users from Keycloak.
                    </p>
                </div>
            </div>
            <UsersClient />
        </div>
    );
}
