import type { GetStudentContestsApiV1StudentsContestsGetParams } from "@/api/generated/model";
import { StudentContestClient } from "@/components/student/contest/student-contest-client";

type SearchParams = Record<string, string | string[] | undefined>;

function str(value: string | string[] | undefined) {
    return Array.isArray(value) ? value[0] : value;
}

function parsePage(value: string | string[] | undefined, fallback: number) {
    const page = Number.parseInt(str(value) ?? "", 10);
    return Number.isFinite(page) && page > 0 ? page : fallback;
}

export default async function MyContestsPage({
    searchParams,
}: {
    searchParams?: Promise<SearchParams>;
}) {
    const resolvedParams = await searchParams;
    const params: GetStudentContestsApiV1StudentsContestsGetParams = {
        registered: true,
        page: parsePage(resolvedParams?.page, 1),
        page_size: parsePage(resolvedParams?.page_size, 12),
        search: str(resolvedParams?.search) ?? undefined,
    };

    return (
        <div className="flex h-full flex-col space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">My Contests</h1>
                <p className="text-sm text-muted-foreground">
                    Find and manage all contests you have registered for.
                </p>
            </div>

            <StudentContestClient initialParams={params} />
        </div>
    );
}
