"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
    AlertCircle,
    Loader2,
    RefreshCw,
    Search,
    ShieldCheck,
    SlidersHorizontal,
    UserRound,
    Users,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import {
    getListUsersApiV1UsersGetQueryKey,
    useListUsersApiV1UsersGet,
    useSyncKeycloakUsersApiV1UsersSyncKeycloakUsersPost,
} from "@/api/generated/users/users";
import { useListAudiencesApiV1AudiencesGet } from "@/api/generated/audiences/audiences";
import {
    UserRole,
    type ListUsersApiV1UsersGetParams,
    type UserResponse,
} from "@/api/generated/model";
import { AppPagination } from "@/components/shared/app-pagination";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useDebounce } from "@/hooks/use-debounce";
import { toApiError } from "@/lib/api/error";
import { cn } from "@/lib/utils";

const ROLE_LABELS: Record<UserRole, string> = {
    [UserRole.admin]: "Admin",
    [UserRole.manager]: "Manager",
    [UserRole.instructor]: "Instructor",
    [UserRole.student]: "Student",
};

const ROLE_STYLES: Record<UserRole, string> = {
    [UserRole.admin]: "bg-destructive/10 text-destructive",
    [UserRole.manager]: "bg-primary/10 text-primary",
    [UserRole.instructor]: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    [UserRole.student]: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
};

function getInitials(user: UserResponse) {
    const source = user.name || user.email || "User";
    return source
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
}

function formatDate(value?: string | null) {
    if (!value) return "Not available";
    return new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(new Date(value));
}

function errorMessage(error: unknown, fallback: string) {
    return toApiError(error).message || fallback;
}

export function UsersClient() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();

    const query = searchParams.get("q") ?? "";
    const [search, setSearch] = useState(query);
    const debouncedSearch = useDebounce(search, 400);

    const page = Number.parseInt(searchParams.get("page") ?? "1", 10) || 1;
    const pageSize = Number.parseInt(searchParams.get("page_size") ?? "20", 10) || 20;
    const role = (searchParams.get("role") as UserRole | null) ?? null;
    const groupId = searchParams.get("group") ?? "";

    const params: ListUsersApiV1UsersGetParams = useMemo(
        () => ({
            page,
            page_size: pageSize,
            q: query || undefined,
            role: role || undefined,
            audience_ids: groupId ? [groupId] : undefined,
        }),
        [groupId, page, pageSize, query, role],
    );

    const { data, isLoading, isError, error, refetch, isFetching } =
        useListUsersApiV1UsersGet(params);
    const { data: groupsData } = useListAudiencesApiV1AudiencesGet({
        page: 1,
        page_size: 100,
    });

    const { mutate: syncUsers, isPending: isSyncing } =
        useSyncKeycloakUsersApiV1UsersSyncKeycloakUsersPost({
            mutation: {
                onSuccess: (response) => {
                    toast.success(
                        `Keycloak sync complete: ${response.users_synced} synced, ${response.skipped_count} skipped.`,
                    );
                    queryClient.invalidateQueries({
                        queryKey: getListUsersApiV1UsersGetQueryKey(),
                    });
                },
                onError: (syncError) => {
                    toast.error(errorMessage(syncError, "Failed to sync Keycloak users"));
                },
            },
        });

    const users = data?.data ?? [];
    const pagination = data?.pagination;
    const groups = groupsData?.data ?? [];

    const updateParams = useCallback(
        (updates: Record<string, string | null>) => {
            const next = new URLSearchParams(searchParams.toString());
            Object.entries(updates).forEach(([key, value]) => {
                if (value) next.set(key, value);
                else next.delete(key);
            });
            router.push(`${pathname}?${next.toString()}`);
        },
        [pathname, router, searchParams],
    );

    useEffect(() => {
        if (query === debouncedSearch) return;
        updateParams({ q: debouncedSearch || null, page: "1" });
    }, [debouncedSearch, query, updateParams]);

    return (
        <div className="flex flex-col gap-5">
            <Card className="border-border/60">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                        <SlidersHorizontal className="size-4 text-primary" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="relative min-w-0 flex-1 lg:max-w-md">
                            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search by name, email, or phone"
                                className="pl-9"
                            />
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <Select
                                value={role ?? "all"}
                                onValueChange={(value) =>
                                    updateParams({
                                        role: value === "all" ? null : value,
                                        page: "1",
                                    })
                                }
                            >
                                <SelectTrigger className="w-full sm:w-40">
                                    <SelectValue placeholder="Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="all">All roles</SelectItem>
                                        <SelectItem value={UserRole.student}>Students</SelectItem>
                                        <SelectItem value={UserRole.instructor}>
                                            Instructors
                                        </SelectItem>
                                        <SelectItem value={UserRole.manager}>Managers</SelectItem>
                                        <SelectItem value={UserRole.admin}>Admins</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            <Select
                                value={groupId || "all"}
                                onValueChange={(value) =>
                                    updateParams({
                                        group: value === "all" ? null : value,
                                        page: "1",
                                    })
                                }
                            >
                                <SelectTrigger className="w-full sm:w-52">
                                    <SelectValue placeholder="Group" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="all">All groups</SelectItem>
                                        {groups.map((group) => (
                                            <SelectItem key={group.id} value={group.id}>
                                                {group.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            <Select
                                value={String(pageSize)}
                                onValueChange={(value) =>
                                    updateParams({ page_size: value, page: "1" })
                                }
                            >
                                <SelectTrigger className="w-full sm:w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="10">10 / page</SelectItem>
                                        <SelectItem value="20">20 / page</SelectItem>
                                        <SelectItem value="50">50 / page</SelectItem>
                                        <SelectItem value="100">100 / page</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            <Button onClick={() => syncUsers()} disabled={isSyncing}>
                                {isSyncing ? (
                                    <Loader2 data-icon="inline-start" className="animate-spin" />
                                ) : (
                                    <RefreshCw data-icon="inline-start" />
                                )}
                                Sync Keycloak
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-border/60">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Users className="size-5 text-primary" />
                        All Users
                    </CardTitle>
                    <div className="text-sm text-muted-foreground">
                        {pagination
                            ? `${pagination.total} users`
                            : isFetching
                              ? "Refreshing..."
                              : null}
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex flex-col gap-2">
                            {Array.from({ length: 8 }).map((_, index) => (
                                <Skeleton key={index} className="h-14 rounded-lg" />
                            ))}
                        </div>
                    ) : isError ? (
                        <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-8 text-center">
                            <AlertCircle className="size-9 text-destructive" />
                            <div>
                                <p className="font-semibold text-destructive">
                                    Failed to load users
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {errorMessage(error, "Please try again.")}
                                </p>
                            </div>
                            <Button variant="outline" onClick={() => refetch()}>
                                Retry
                            </Button>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="flex min-h-[240px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-muted-foreground">
                            <UserRound className="size-9 opacity-40" />
                            <p className="text-sm font-medium">No users found</p>
                            <p className="max-w-sm text-center text-xs">
                                Adjust the filters or sync users from Keycloak.
                            </p>
                        </div>
                    ) : (
                        <div className="rounded-lg border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Groups</TableHead>
                                        <TableHead>Phone</TableHead>
                                        <TableHead>Joined</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow key={user.id} className="hover:bg-muted/40">
                                            <TableCell>
                                                <div className="flex min-w-0 items-center gap-3">
                                                    <Avatar>
                                                        <AvatarFallback className="text-xs font-medium">
                                                            {getInitials(user)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="min-w-0">
                                                        <p className="truncate font-medium">
                                                            {user.name || "Unnamed user"}
                                                        </p>
                                                        <p className="truncate text-xs text-muted-foreground">
                                                            {user.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="secondary"
                                                    className={cn(
                                                        "border-transparent",
                                                        ROLE_STYLES[user.role],
                                                    )}
                                                >
                                                    {ROLE_LABELS[user.role]}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex max-w-xs flex-wrap gap-1">
                                                    {(user.audience_links ?? []).length > 0 ? (
                                                        user.audience_links
                                                            ?.slice(0, 3)
                                                            .map((group) => (
                                                                <Badge
                                                                    key={group.id}
                                                                    variant="outline"
                                                                    className="font-normal"
                                                                >
                                                                    {group.name}
                                                                </Badge>
                                                            ))
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground">
                                                            No groups
                                                        </span>
                                                    )}
                                                    {(user.audience_links?.length ?? 0) > 3 && (
                                                        <Badge variant="secondary">
                                                            +
                                                            {(user.audience_links?.length ?? 0) - 3}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {user.phone_no || "Not added"}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                <div className="flex items-center gap-2">
                                                    <ShieldCheck className="size-4" />
                                                    {formatDate(user.created_at)}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {pagination && pagination.total_pages > 1 && (
                <AppPagination
                    currentPage={pagination.page}
                    totalPages={pagination.total_pages}
                    hasPrevious={pagination.has_previous}
                    hasNext={pagination.has_next}
                    onPageChange={(nextPage) => updateParams({ page: String(nextPage) })}
                />
            )}
        </div>
    );
}
