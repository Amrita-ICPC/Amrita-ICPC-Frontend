import { Metadata } from "next";

import { BankDetailClient } from "@/components/banks/bank-detail-client";

interface BankPageProps {
    params: Promise<{
        id: string;
    }>;
}

export const metadata: Metadata = {
    title: "Bank Details | Amrita ICPC",
    description: "Manage your question bank and questions.",
};

export default async function BankPage({ params }: BankPageProps) {
    const { id } = await params;

    return <BankDetailClient bankId={id} />;
}
