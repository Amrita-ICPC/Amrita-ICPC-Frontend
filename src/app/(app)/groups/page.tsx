import AuthGuard from "@/components/global/auth-guard";
import { GroupsClient } from "@/components/groups/groups-client";
import { UserType } from "@/lib/auth/utils";

export default async function GroupsPage() {
    return (
        <AuthGuard requiredGroups={[UserType.ADMIN]}>
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Groups</h1>
                    <p className="text-sm text-muted-foreground">
                        Create student groups and manage membership across classes, batches, and
                        campuses.
                    </p>
                </div>
                <GroupsClient />
            </div>
        </AuthGuard>
    );
}
