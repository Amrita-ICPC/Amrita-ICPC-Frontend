import { redirect } from "next/navigation";

import { auth } from "@/lib/auth/auth";
import { Roles } from "@/lib/auth/utils";
import AuthGuard from "@/components/global/auth-guard";
import AccessDenied from "@/components/global/access-denied";
import { CreateContestClient } from "./create-contest-client";

export const dynamic = "force-dynamic";

export default async function CreateContestPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/login");
    }

    return (
        <div className="mx-auto flex h-full w-full max-w-6xl flex-col gap-6 p-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Create Contest</h1>
                <p className="text-muted-foreground">
                    Set up contest details, registration, and visibility.
                </p>
            </div>

            <AuthGuard requiredRoles={[Roles.CONTEST_CREATE]} fallbackComponent={<AccessDenied />}>
                <CreateContestClient />
            </AuthGuard>
        </div>
    );
}
