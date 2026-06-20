import { MemberResultClient } from "@/components/student/contest/results/member-result-client";

export default async function StudentMemberResultPage({
    params,
}: {
    params: Promise<{ id: string; memberId: string }>;
}) {
    const { id, memberId } = await params;

    return <MemberResultClient contestId={id} memberId={memberId} />;
}
