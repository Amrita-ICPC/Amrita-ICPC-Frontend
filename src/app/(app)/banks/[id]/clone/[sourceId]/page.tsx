import { BankPartialCloneClient } from "@/components/banks/bank-partial-clone-client";
import { Metadata } from "next";

interface PartialClonePageProps {
    params: Promise<{
        id: string;
        sourceId: string;
    }>;
}

export const metadata: Metadata = {
    title: "Partial Clone | Amrita ICPC",
    description: "Select questions to clone from one bank to another.",
};

export default async function PartialClonePage({ params }: PartialClonePageProps) {
    const { id, sourceId } = await params;

    return (
        <div className="container py-8 max-w-7xl mx-auto">
            <BankPartialCloneClient targetBankId={id} sourceBankId={sourceId} />
        </div>
    );
}
