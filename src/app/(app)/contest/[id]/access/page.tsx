import { ContestAccessClient } from "@/components/contest/contest-access-client";

export default async function ContestAccessPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return <ContestAccessClient contestId={id} />;
}
