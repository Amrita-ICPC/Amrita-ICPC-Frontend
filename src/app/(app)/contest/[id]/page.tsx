import { ContestDetailClient } from "@/components/contest/contest-detail-client";

export default async function ContestDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <ContestDetailClient contestId={id} />;
}
