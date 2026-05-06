import { StudentContestView } from "@/components/contest/student-contest-view";

export default async function StudentContestPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <StudentContestView contestId={id} />;
}
