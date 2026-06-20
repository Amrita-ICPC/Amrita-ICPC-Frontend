import { LeaderboardClient } from "@/components/student/contest/results/leaderboard-client";

interface LeaderboardPageProps {
    params: Promise<{ id: string }>;
}

export default async function LeaderboardPage({ params }: LeaderboardPageProps) {
    const { id } = await params;

    return <LeaderboardClient contestId={id} />;
}
