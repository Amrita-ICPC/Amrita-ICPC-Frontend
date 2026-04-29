import { ContestQuestionsClient } from "@/components/contest/contest-questions-client";

export default async function ContestQuestionsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <ContestQuestionsClient contestId={id} />;
}
