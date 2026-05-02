import ContestQuestionEditorPage from "@/components/contest/contest-question-editor-client";

function isEditMode(edit: string | string[] | undefined) {
    const value = Array.isArray(edit) ? edit[0] : edit;
    return value === "1" || value === "true";
}

export default async function QuestionsPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string; questionId: string }>;
    searchParams: Promise<{ edit?: string | string[] }>;
}) {
    const { id, questionId } = await params;
    const { edit } = await searchParams;

    const isEdit = isEditMode(edit);

    if (questionId == "new" || isEdit) {
        return <ContestQuestionEditorPage contestId={id} questionId={questionId} isEdit={isEdit} />;
    }

    return (
        <div>
            Question ID: {questionId} for Contest ID: {id}
        </div>
    );
}
