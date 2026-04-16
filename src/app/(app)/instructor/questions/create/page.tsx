"use client";

import { AuthGuard } from "@/components/auth/auth-guard";
import { CreateQuestionForm } from "@/components/instructor/create-question-form";

export default function CreateQuestionPage() {
    return (
        <AuthGuard requiredRoles={["instructor", "admin"]} redirectTo="/dashboard">
            <CreateQuestionForm />
        </AuthGuard>
    );
}
