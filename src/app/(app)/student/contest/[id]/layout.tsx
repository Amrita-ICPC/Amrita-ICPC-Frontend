import { ContestProvider } from "@/lib/providers/contest-provider";

interface LayoutProps {
    children: React.ReactNode;
    params: Promise<{ id: string }>;
}

export default async function StudentContestLayout({ children, params }: LayoutProps) {
    const { id } = await params;
    return <ContestProvider contestId={id}>{children}</ContestProvider>;
}
