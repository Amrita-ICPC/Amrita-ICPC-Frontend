import { auth } from "@/lib/auth/auth";
import { UserType } from "@/lib/auth/utils";
import { CodeEditor } from "@/components/questions/code-editor";
import { QuestionWizard } from "@/components/questions/question-wizard";

export default async function QuestionsPage() {
    const session = await auth();
    const user = session?.user;
    const allRoles = [...(user?.roles ?? []), ...(user?.groups ?? [])];

    const hasRole = (role: string) => allRoles.some((r) => r.toLowerCase() === role.toLowerCase());

    const isAdmin = hasRole(UserType.ADMIN);
    const isManager = hasRole(UserType.MANAGER);
    const isInstructor = hasRole(UserType.INSTRUCTOR);

    const isStaff = isAdmin || isManager || isInstructor;

    if (isStaff) {
        return (
            <div className="container py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Question Editor</h1>
                    <p className="text-muted-foreground mt-1">
                        Create and configure new programming problems.
                    </p>
                </div>
                <QuestionWizard />
            </div>
        );
    }

    return <CodeEditor />;
}
