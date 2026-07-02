import type { Metadata } from "next";

import { QuestionImportClient } from "@/components/banks/question-import-client";

export const metadata: Metadata = { title: "Import Questions | Amrita ICPC" };

export default async function BankImportPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <QuestionImportClient targetId={id} destination="bank" />;
}
