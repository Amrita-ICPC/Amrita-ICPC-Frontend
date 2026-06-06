import { Metadata } from "next";

import { ContestPartialCloneClient } from "@/components/contest/contest-partial-clone-client";

interface PartialClonePageProps {
    params: Promise<{
        id: string;
        sourceId: string;
    }>;
}

export const metadata: Metadata = {
    title: "Import from Bank | Amrita ICPC",
    description: "Select questions to clone from a bank to your contest.",
};

export default async function PartialClonePage({ params }: PartialClonePageProps) {
    const { id, sourceId } = await params;

    return (
        <div className="container py-8 max-w-7xl mx-auto">
            <ContestPartialCloneClient contestId={id} sourceBankId={sourceId} />
        </div>
    );
}
