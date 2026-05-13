import AccessDenied from "@/components/global/access-denied";
import { GroupsClient } from "@/components/groups/groups-client";
import { auth } from "@/lib/auth/auth";
import { isAdmin } from "@/lib/auth/guards";

export default async function GroupsPage() {
    const session = await auth();

    if (!isAdmin(session?.user)) {
        return <AccessDenied />;
    }

    return (
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
    );
}
