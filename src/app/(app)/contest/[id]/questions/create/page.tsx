import { ContestQuestionsCreateClient } from "@/components/contest/contest-questions-create-client";

export default async function CreateQuestionPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <ContestQuestionsCreateClient contestId={id} />;
}
