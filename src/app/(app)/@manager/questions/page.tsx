import { Metadata } from "next";
import { QuestionWizard } from "@/components/questions/question-wizard";

export const metadata: Metadata = {
    title: "Question Editor | Amrita ICPC",
    description: "Author and manage contest questions.",
};

export default function QuestionsPage() {
    return (
        <div className="space-y-8 pb-12">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">Question Editor</h1>
                <p className="text-white/50 mt-1">
                    Design complex multi-language problems with real-time validation.
                </p>
            </div>

            <QuestionWizard />
        </div>
    );
}
