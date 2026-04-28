import { Plus } from "lucide-react";
import Link from "next/link";

import type {
    GetAllContestsApiV1ContestsGetParams,
    ContestStatus,
    ContestRunStatus,
} from "@/api/generated/model";
import { hasPermission } from "@/lib/auth/utils";
import { auth } from "@/lib/auth/auth";
import { Button } from "@/components/ui/button";
import { ContestClient } from "@/components/contest/contest-client";

type SearchParams = Record<string, string | string[] | undefined>;

function str(v: string | string[] | undefined) {
    return Array.isArray(v) ? v[0] : v;
}

function parsePage(v: string | string[] | undefined, fallback: number) {
    const n = Number.parseInt(str(v) ?? "", 10);
    return Number.isFinite(n) && n > 0 ? n : fallback;
}

export default async function ContestPage(props: { searchParams?: Promise<SearchParams> }) {
    const [resolvedParams, session] = await Promise.all([props.searchParams, auth()]);

    const params: GetAllContestsApiV1ContestsGetParams = {
        page: parsePage(resolvedParams?.page, 1),
        page_size: parsePage(resolvedParams?.page_size, 12),
        contest_status: (str(resolvedParams?.contest_status) as ContestStatus) ?? undefined,
        run_status: (str(resolvedParams?.run_status) as ContestRunStatus) ?? undefined,
        search: str(resolvedParams?.search) ?? undefined,
    };

    const canRead = hasPermission(session?.user, ["contests:read"]);
    const canCreate = hasPermission(session?.user, ["contests:create"]);

    return (
        <div className="flex h-full flex-col space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Contests</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage and explore programming contests.
                    </p>
                </div>
                {canCreate && (
                    <Button asChild>
                        <Link href="/contest/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Contest
                        </Link>
                    </Button>
                )}
            </div>

            {canRead ? (
                <ContestClient initialParams={params} />
            ) : (
                <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed text-center p-8">
                    <h3 className="mb-1 text-lg font-semibold">Access Denied</h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                        You don&apos;t have permission to view contests.
                    </p>
                </div>
            )}
        </div>
    );
}
