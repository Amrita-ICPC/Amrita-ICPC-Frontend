import { redirect } from "next/navigation";

import { auth } from "@/lib/auth/auth";
import { Roles } from "@/lib/auth/utils";
import AuthGuard from "@/components/global/auth-guard";
import AccessDenied from "@/components/global/access-denied";
import { EditContestClient } from "./edit-contest-client";

export const dynamic = "force-dynamic";

export default async function EditContestPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/login");
    }

    const { id } = await params;
    return (
        <div className="flex h-full flex-col gap-6 p-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Edit Contest</h1>
                <p className="text-muted-foreground">
                    Modify contest details, schedule, and settings.
                </p>
            </div>

            <AuthGuard requiredRoles={[Roles.CONTEST_CREATE]} fallbackComponent={<AccessDenied />}>
                <EditContestClient contestId={id} />
            </AuthGuard>
        </div>
    );
}
