import type { GetStudentContestsApiV1StudentsContestsGetParams } from "@/api/generated/model";
import { StudentContestClient } from "@/components/student/student-contest-client";

type SearchParams = Record<string, string | string[] | undefined>;

function str(v: string | string[] | undefined) {
    return Array.isArray(v) ? v[0] : v;
}

function parsePage(v: string | string[] | undefined, fallback: number) {
    const n = Number.parseInt(str(v) ?? "", 10);
    return Number.isFinite(n) && n > 0 ? n : fallback;
}

export default async function StudentDashboardPage(props: {
    searchParams?: Promise<SearchParams>;
}) {
    const resolvedParams = await props.searchParams;

    const params: GetStudentContestsApiV1StudentsContestsGetParams = {
        page: parsePage(resolvedParams?.page, 1),
        page_size: parsePage(resolvedParams?.page_size, 12),
        search: str(resolvedParams?.search) ?? undefined,
    };

    return (
        <div className="flex h-full flex-col space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Available Contests</h1>
                    <p className="text-sm text-muted-foreground">
                        Browse and register for upcoming programming contests.
                    </p>
                </div>
            </div>

            <StudentContestClient initialParams={params} />
        </div>
    );
}
