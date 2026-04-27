import { CreateQuestionClient } from "@/app/(app)/@manager/banks/[bankId]/questions/create/create-question-client";
import AccessDenied from "@/components/global/access-denied";
import AuthGuard from "@/components/global/auth-guard";
import { UserType } from "@/lib/auth/utils";

export default async function CreateQuestionPage() {
    return (
        <AuthGuard requiredGroups={[UserType.MANAGER, UserType.ADMIN]} fallbackComponent={<AccessDenied />}>
            <CreateQuestionClient />
        </AuthGuard>
    );
}
