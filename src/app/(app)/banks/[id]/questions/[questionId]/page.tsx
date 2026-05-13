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

    if (questionId === "new" || isEdit) {
        return (
            <div className="mx-auto w-full max-w-6xl">
                <BankQuestionEditorClient
                    bankId={id}
                    questionId={questionId === "new" ? undefined : questionId}
                    isEdit={isEdit}
                />
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-6xl">
            <h1 className="text-2xl font-bold">Question View</h1>
            <p className="text-muted-foreground mt-2">
                Viewing question {questionId} in bank {id}
            </p>
            {/* TODO: Add BankQuestionViewClient if needed */}
        </div>
    );
}
