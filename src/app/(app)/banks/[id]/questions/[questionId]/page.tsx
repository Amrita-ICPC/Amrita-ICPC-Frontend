import BankQuestionEditorClient from "@/components/banks/bank-question-editor-client";

function isEditMode(edit: string | string[] | undefined) {
    const value = Array.isArray(edit) ? edit[0] : edit;
    return value === "1" || value === "true";
}

export default async function BankQuestionPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string; questionId: string }>;
    searchParams: Promise<{ edit?: string | string[] }>;
}) {
    const { id, questionId } = await params;
    const { edit } = await searchParams;

    const isEdit = isEditMode(edit);

    return (
        <BankQuestionEditorClient
            bankId={id}
            questionId={questionId === "new" ? undefined : questionId}
            isEdit={isEdit}
        />
    );
}
