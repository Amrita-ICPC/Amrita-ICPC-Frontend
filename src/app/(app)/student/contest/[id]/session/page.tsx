import { SessionClient } from "@/components/student/contest/session/session-client";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function SessionPage({ params }: PageProps) {
    const resolvedParams = await params;
    return <SessionClient contestId={resolvedParams.id} />;
}
