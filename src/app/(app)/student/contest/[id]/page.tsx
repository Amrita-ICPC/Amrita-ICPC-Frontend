import { StudentContestDetailClient } from "@/components/student/contest/student-contest-detail-client";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function StudentContestDetailPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams?: Promise<SearchParams>;
}) {
    const [{ id }] = await Promise.all([params, searchParams]);

    return <StudentContestDetailClient contestId={id} />;
}
