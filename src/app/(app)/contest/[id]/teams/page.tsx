import { ContestTeamsClient } from "@/components/teams/contest-teams-client";

export default async function ContestTeamsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <ContestTeamsClient contestId={id} />;
}
