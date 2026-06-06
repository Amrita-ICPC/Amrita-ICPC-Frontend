import { redirect } from "next/navigation";

import AccessDenied from "@/components/global/access-denied";
import ContestTeamInvitationClient from "@/components/student/invitation/invitation-client";
import { auth } from "@/lib/auth/auth";
import { getDefaultRoute } from "@/lib/auth/utils";

export default async function InvitationPage() {
    const session = await auth();
    if (!session?.user) {
        redirect("/auth/login");
    }

    const isStudent = getDefaultRoute(session.user) === "/student/dashboard";
    if (!isStudent) {
        return <AccessDenied />;
    }

    return (
        <div className="flex h-full flex-col space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Team Invitations
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        View and manage your pending contest team invitations
                    </p>
                </div>
            </div>

            <ContestTeamInvitationClient />
        </div>
    );
}
