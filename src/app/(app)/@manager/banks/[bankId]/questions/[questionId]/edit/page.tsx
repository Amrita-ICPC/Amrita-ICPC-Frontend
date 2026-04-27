import { EditQuestionClient } from "@/app/(app)/@manager/banks/[bankId]/questions/[questionId]/edit/edit-question-client";
import AccessDenied from "@/components/global/access-denied";
import AuthGuard from "@/components/global/auth-guard";
import { UserType } from "@/lib/auth/utils";

export default async function EditQuestionPage() {
    return (
        <AuthGuard requiredGroups={[UserType.MANAGER, UserType.ADMIN]} fallbackComponent={<AccessDenied />}>
            <EditQuestionClient />
        </AuthGuard>
    );
}
