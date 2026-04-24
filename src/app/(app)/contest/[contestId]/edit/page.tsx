"use client";

import { use } from "react";
import { EditContestClient } from "./edit-contest-client";

interface ContestEditPageProps {
    params: Promise<{ contestId: string }>;
}

export default function ContestEditPage({ params }: ContestEditPageProps) {
    const { contestId } = use(params);
    return <EditContestClient contestId={contestId} />;
}
