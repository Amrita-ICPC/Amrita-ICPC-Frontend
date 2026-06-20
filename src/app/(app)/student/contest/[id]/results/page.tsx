import { ResultsOverviewClient } from "@/components/student/contest/results/results-overview-client";

export default async function StudentContestResultsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    return <ResultsOverviewClient contestId={id} />;
}
