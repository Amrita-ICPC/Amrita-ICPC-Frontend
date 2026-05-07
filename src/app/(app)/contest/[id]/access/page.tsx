import { auth } from "@/lib/auth/auth";
import { UserType, hasAccess } from "@/lib/auth/utils";
import { redirect } from "next/navigation";
import { ContestAccessClient } from "@/components/contest/contest-access-client";

export default async function ContestAccessPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth();

    if (!session) {
        redirect("/auth/login");
    }

    if (
        !hasAccess(session.user.roles, session.user.groups, [
            UserType.ADMIN,
            UserType.MANAGER,
            UserType.INSTRUCTOR,
        ])
    ) {
        redirect("/not-found");
    }

    return <ContestAccessClient contestId={id} />;
}
