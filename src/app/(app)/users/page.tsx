import AuthGuard from "@/components/global/auth-guard";
import { UsersClient } from "@/components/users/users-client";
import { UserType } from "@/lib/auth/utils";

export default async function UsersPage() {
    return (
        <AuthGuard requiredGroups={[UserType.ADMIN]}>
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
        </AuthGuard>
    );
}
