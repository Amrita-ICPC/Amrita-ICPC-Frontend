"use client";

import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { QuestionWizard } from "@/components/questions/question-wizard";

export function CreateQuestionClient() {
    const router = useRouter();
    const params = useParams();
    const bankId = params.bankId as string;

    const handleSuccess = () => {
        router.push(`/banks/${bankId}`);
    };

    return (
        <div className="flex flex-col space-y-8 max-w-5xl mx-auto pb-12">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="text-white/40 hover:text-white hover:bg-white/5">
                    <Link href={`/banks/${bankId}`}>
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Create Question</h1>
                    <p className="text-white/50 mt-1 text-sm">Add a new coding problem to this bank.</p>
                </div>
            </div>

            <QuestionWizard bankId={bankId} onSuccess={handleSuccess} />
        </div>
    );
}
