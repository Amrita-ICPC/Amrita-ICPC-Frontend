import { Plus } from "lucide-react";
import Link from "next/link";

import type { GetContestsParams } from "@/types/contest";
import { Roles } from "@/lib/auth/utils";
import { auth } from "@/lib/auth/auth";
import { getSingleValue, parseBoolean, parsePage } from "@/lib/search-params";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ContestClient } from "@/components/contest/contest-client";
import AuthGuard from "@/components/global/auth-guard";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function ContestPage(props: { searchParams?: Promise<SearchParams> }) {
    const resolvedParams = await props.searchParams;
    const params: GetContestsParams = {
        page: parsePage(resolvedParams?.page, 1),
        page_size: parsePage(resolvedParams?.page_size, 10),
        contest_status: getSingleValue(resolvedParams?.contest_status) ?? undefined,
        search: getSingleValue(resolvedParams?.search) ?? undefined,
        is_public: parseBoolean(resolvedParams?.is_public),
    };
    await auth();

    return (
        <div className="flex h-full flex-col space-y-6 p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Contests</h1>
                    <p className="text-muted-foreground">
                        Manage and explore upcoming programming contests.
                    </p>
                </div>
                <AuthGuard requiredRoles={[Roles.CONTEST_CREATE]} fallbackComponent={null}>
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
                </AuthGuard>
            </div>
            <AuthGuard
                requiredRoles={[Roles.CONTEST_READ]}
                fallbackComponent={
                    <div className="flex w-full min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed text-center p-8">
                        <h3 className="mb-2 text-xl font-semibold">Access Denied</h3>
                        <p className="text-sm text-muted-foreground max-w-md">
                            You do not have the required permissions to view the contests list.
                            Please contact your system administrator if you believe this is an
                            error.
                        </p>
                    </div>
                }
            >
                <ContestClient initialParams={params} />
            </AuthGuard>
        </div>
    );
}
