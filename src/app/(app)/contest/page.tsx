import { Plus } from "lucide-react";
import Link from "next/link";

import type { GetContestsParams } from "@/types/contest";
import { hasPermission } from "@/lib/auth/utils";
import { auth } from "@/lib/auth/auth";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ContestClient } from "@/components/contest/contest-client";

type SearchParams = Record<string, string | string[] | undefined>;

function getSingleValue(value: string | string[] | undefined) {
    return Array.isArray(value) ? value[0] : value;
}

function parsePage(value: string | string[] | undefined, fallback: number) {
    const parsed = Number.parseInt(getSingleValue(value) ?? "", 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseBoolean(value: string | string[] | undefined) {
    const normalized = getSingleValue(value);
    if (normalized === "true") return true;
    if (normalized === "false") return false;
    return undefined;
}

export default async function ContestPage(props: { searchParams?: Promise<SearchParams> }) {
    const resolvedParams = await props.searchParams;
    const params: GetContestsParams = {
        page: parsePage(resolvedParams?.page, 1),
        page_size: parsePage(resolvedParams?.page_size, 10),
        contest_status: getSingleValue(resolvedParams?.contest_status) ?? undefined,
        search: getSingleValue(resolvedParams?.search) ?? undefined,
        is_public: parseBoolean(resolvedParams?.is_public),
    };
    const session = await auth();

    const isContestRead = hasPermission(session?.user, ["contests:read"]);
    const isContestCreate = hasPermission(session?.user, ["contests:create"]);

    return (
        <div className="flex h-full flex-col space-y-6 p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Contests</h1>
                    <p className="text-muted-foreground">
                        Manage and explore upcoming programming contests.
                    </p>
                </div>
                {isContestCreate && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button asChild>
                                <Link href="/contest/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Contest
                                </Link>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Set up a new programming contest</p>
                        </TooltipContent>
                    </Tooltip>
                )}
            </div>

            {isContestRead ? (
                <ContestClient initialParams={params} />
            ) : (
                <div className="flex w-full min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed text-center p-8">
                    <h3 className="mb-2 text-xl font-semibold">Access Denied</h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                        You do not have the required permissions to view the contests list. Please
                        contact your system administrator if you believe this is an error.
                    </p>
                </div>
            )}
        </div>
    );
}
