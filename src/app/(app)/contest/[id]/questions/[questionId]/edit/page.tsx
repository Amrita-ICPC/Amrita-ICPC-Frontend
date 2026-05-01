import { ContestQuestionsUpdateClient } from "@/components/contest/contest-questions-update-client";

export default async function EditQuestionPage({
    params,
}: {
    params: Promise<{ id: string; questionId: string }>;
}) {
    const { id, questionId } = await params;
    return <ContestQuestionsUpdateClient contestId={id} questionId={questionId} />;
}
