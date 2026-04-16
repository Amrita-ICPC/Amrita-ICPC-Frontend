import { AuthGuard } from "@/components/auth/auth-guard";
import { EditQuestionForm } from "@/components/instructor/edit-question-form";

export default function EditQuestionPage({ params }: { params: { id: string } }) {
    return (
        <AuthGuard requiredRoles={["instructor", "admin"]} redirectTo="/dashboard">
            <div className="space-y-6">
                <EditQuestionForm questionId={params.id} />
            </div>
        </AuthGuard>
    );
}
