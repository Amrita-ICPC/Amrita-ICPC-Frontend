"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
    AlertCircle,
    ArrowLeft,
    Check,
    Loader2,
    Search,
    Trash2,
    UserPlus,
    Users,
    X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
    getGetAudienceApiV1AudiencesAudienceIdGetQueryKey,
    getListAudiencesApiV1AudiencesGetQueryKey,
    getListAudienceUsersApiV1AudiencesAudienceIdUsersGetQueryKey,
    useAddUsersToAudienceApiV1AudiencesAudienceIdUsersPost,
    useGetAudienceApiV1AudiencesAudienceIdGet,
    useListAudienceUsersApiV1AudiencesAudienceIdUsersGet,
    useRemoveUsersFromAudienceApiV1AudiencesAudienceIdUsersDelete,
} from "@/api/generated/audiences/audiences";
import {
    type AudienceResponse,
    AudienceType,
    type UserResponse,
    UserRole,
} from "@/api/generated/model";
import { useListUsersApiV1UsersGet } from "@/api/generated/users/users";
import { AppPagination } from "@/components/shared/app-pagination";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
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

type RoleFilter = UserRole | "all";

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

const TYPE_LABELS: Record<AudienceType, string> = {
    [AudienceType.class]: "Class",
    [AudienceType.department]: "Department",
    [AudienceType.batch]: "Batch",
    [AudienceType.campus]: "Campus",
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

function getErrorMessage(error: unknown, fallback: string) {
    return toApiError(error).message || fallback;
}

function countSummary(group: AudienceResponse) {
    return [
        { label: "Students", value: group.student_count ?? 0 },
        { label: "Instructors", value: group.instructor_count ?? 0 },
        { label: "Managers", value: group.manager_count ?? 0 },
    ];
}

function RoleBadge({ role }: { role: UserRole }) {
    return (
        <Badge variant="secondary" className={cn("border-transparent", ROLE_STYLES[role])}>
            {ROLE_LABELS[role]}
        </Badge>
    );
}

function PeoplePicker({
    group,
    currentUsers,
}: {
    group: AudienceResponse;
    currentUsers: UserResponse[];
}) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();
    const queryClient = useQueryClient();
    const addQuery = searchParams.get("add_q") ?? "";
    const addRole = (searchParams.get("add_role") as RoleFilter | null) ?? "all";
    const [search, setSearch] = useState(addQuery);
    const [selectedUsers, setSelectedUsers] = useState<Record<string, UserResponse>>({});
    const debouncedSearch = useDebounce(search, 400);

    const currentUserIds = useMemo(
        () => new Set(currentUsers.map((user) => user.user_id)),
        [currentUsers],
    );

    const { data, isFetching } = useListUsersApiV1UsersGet(
        {
            q: debouncedSearch || undefined,
            role: addRole === "all" ? undefined : addRole,
            page: 1,
            page_size: 20,
        },
        {
            query: {
                enabled: debouncedSearch.trim().length >= 2,
            },
        },
    );

    const { mutate: addUsers, isPending: isAdding } =
        useAddUsersToAudienceApiV1AudiencesAudienceIdUsersPost({
            mutation: {
                onSuccess: () => {
                    toast.success("People added to group");
                    setSelectedUsers({});
                    setSearch("");
                    queryClient.invalidateQueries({
                        queryKey: getListAudienceUsersApiV1AudiencesAudienceIdUsersGetQueryKey(
                            group.id,
                        ),
                    });
                    queryClient.invalidateQueries({
                        queryKey: getListAudiencesApiV1AudiencesGetQueryKey(),
                    });
                    queryClient.invalidateQueries({
                        queryKey: getGetAudienceApiV1AudiencesAudienceIdGetQueryKey(group.id),
                    });
                },
                onError: (error) => toast.error(getErrorMessage(error, "Failed to add people")),
            },
        });

    const selectedList = Object.values(selectedUsers);
    const results = (data?.data ?? []).filter((user) => !currentUserIds.has(user.user_id));
    const selectableResults = results.filter((user) => !selectedUsers[user.user_id]);
    const hasSearchResults = debouncedSearch.trim().length >= 2 && results.length > 0;

    const updateAddParams = useCallback(
        (updates: Record<string, string | null>) => {
            const next = new URLSearchParams(searchParams.toString());
            Object.entries(updates).forEach(([key, value]) => {
                if (value) next.set(key, value);
                else next.delete(key);
            });
            router.replace(`${pathname}?${next.toString()}`);
        },
        [pathname, router, searchParams],
    );

    useEffect(() => {
        if (addQuery === debouncedSearch) return;
        updateAddParams({ add_q: debouncedSearch || null });
    }, [addQuery, debouncedSearch, updateAddParams]);

    function toggleUser(user: UserResponse) {
        setSelectedUsers((current) => {
            const next = { ...current };
            if (next[user.user_id]) delete next[user.user_id];
            else next[user.user_id] = user;
            return next;
        });
    }

    function selectAllResults() {
        if (selectableResults.length === 0) return;
        setSelectedUsers((current) => {
            const next = { ...current };
            selectableResults.forEach((user) => {
                next[user.user_id] = user;
            });
            return next;
        });
    }

    function addSelected() {
        if (selectedList.length === 0) return;
        addUsers({
            audienceId: group.id,
            data: { user_ids: selectedList.map((user) => user.id) },
        });
    }

    return (
        <Card className="border-border/60 transition-all hover:border-primary/40 hover:shadow-md">
            <CardHeader className="pb-3">
                <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <UserPlus className="size-5 text-primary" />
                            Add People
                        </CardTitle>
                        <CardDescription>
                            Search and select managers, instructors, or students in one batch.
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={
                                !hasSearchResults || selectableResults.length === 0 || isAdding
                            }
                            onClick={selectAllResults}
                        >
                            Select all
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={selectedList.length === 0 || isAdding}
                            onClick={() => setSelectedUsers({})}
                        >
                            Clear
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-2 lg:grid-cols-[minmax(0,1fr)_180px]">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search by name, email, or phone"
                            className="pl-9"
                        />
                        {isFetching && (
                            <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                        )}
                    </div>
                    <Select
                        value={addRole}
                        onValueChange={(value) => {
                            setSelectedUsers({});
                            updateAddParams({
                                add_role: value === "all" ? null : value,
                            });
                        }}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="all">All roles</SelectItem>
                                <SelectItem value={UserRole.manager}>Managers</SelectItem>
                                <SelectItem value={UserRole.instructor}>Instructors</SelectItem>
                                <SelectItem value={UserRole.student}>Students</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>

                <div className="rounded-lg border bg-muted/20 p-3">
                    {selectedList.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            Selected users will appear here before you add them.
                        </p>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {selectedList.map((user) => (
                                <Badge
                                    key={user.user_id}
                                    variant="secondary"
                                    className="max-w-full gap-1 pr-1"
                                >
                                    <span className="truncate">
                                        {user.name || user.email} · {ROLE_LABELS[user.role]}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => toggleUser(user)}
                                        className="rounded-full p-0.5 hover:bg-background"
                                        aria-label={`Remove ${user.name || user.email}`}
                                    >
                                        <X className="size-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>

                <ScrollArea className="h-80 rounded-lg border">
                    {debouncedSearch.trim().length < 2 ? (
                        <div className="flex h-80 items-center justify-center px-4 text-center text-sm text-muted-foreground">
                            Type at least 2 characters to search people.
                        </div>
                    ) : results.length === 0 && !isFetching ? (
                        <div className="flex h-80 items-center justify-center px-4 text-center text-sm text-muted-foreground">
                            No available people found for this search.
                        </div>
                    ) : (
                        <div className="divide-y">
                            {results.map((user) => {
                                const selected = !!selectedUsers[user.user_id];
                                return (
                                    <button
                                        key={user.user_id}
                                        type="button"
                                        onClick={() => toggleUser(user)}
                                        className={cn(
                                            "group flex w-full cursor-pointer items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-muted/40",
                                            selected && "bg-primary/10",
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "flex size-5 shrink-0 items-center justify-center rounded border",
                                                selected
                                                    ? "border-primary bg-primary text-primary-foreground"
                                                    : "border-border bg-background",
                                            )}
                                        >
                                            {selected && <Check className="size-3" />}
                                        </div>
                                        <Avatar>
                                            <AvatarFallback className="text-xs">
                                                {getInitials(user)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">
                                                {user.name || "Unnamed user"}
                                            </p>
                                            <p className="truncate text-xs text-muted-foreground">
                                                {user.email}
                                            </p>
                                        </div>
                                        <RoleBadge role={user.role} />
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>

                <Button onClick={addSelected} disabled={isAdding || selectedList.length === 0}>
                    {isAdding ? (
                        <Loader2 data-icon="inline-start" className="animate-spin" />
                    ) : (
                        <UserPlus data-icon="inline-start" />
                    )}
                    Add {selectedList.length || ""} selected
                </Button>
            </CardContent>
        </Card>
    );
}

function GroupMembers({ group }: { group: AudienceResponse }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();
    const memberQuery = searchParams.get("member_q") ?? "";
    const [memberSearch, setMemberSearch] = useState(memberQuery);
    const debouncedMemberSearch = useDebounce(memberSearch, 400);
    const memberPage = Number.parseInt(searchParams.get("member_page") ?? "1", 10) || 1;
    const memberRole = (searchParams.get("member_role") as RoleFilter | null) ?? "all";

    const { data, isLoading, isError, error, refetch } =
        useListAudienceUsersApiV1AudiencesAudienceIdUsersGet(group.id, {
            page: memberPage,
            page_size: 10,
            q: memberQuery || undefined,
            role: memberRole === "all" ? undefined : memberRole,
        });

    const { mutate: removeUsers, isPending: isRemoving } =
        useRemoveUsersFromAudienceApiV1AudiencesAudienceIdUsersDelete({
            mutation: {
                onSuccess: () => {
                    toast.success("User removed from group");
                    queryClient.invalidateQueries({
                        queryKey: getListAudienceUsersApiV1AudiencesAudienceIdUsersGetQueryKey(
                            group.id,
                        ),
                    });
                    queryClient.invalidateQueries({
                        queryKey: getListAudiencesApiV1AudiencesGetQueryKey(),
                    });
                    queryClient.invalidateQueries({
                        queryKey: getGetAudienceApiV1AudiencesAudienceIdGetQueryKey(group.id),
                    });
                },
                onError: (removeError) =>
                    toast.error(getErrorMessage(removeError, "Failed to remove user")),
            },
        });

    const users = data?.data?.users ?? [];
    const pagination = data?.pagination;

    const updateMemberParams = useCallback(
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
        if (memberQuery === debouncedMemberSearch) return;
        updateMemberParams({ member_q: debouncedMemberSearch || null, member_page: "1" });
    }, [debouncedMemberSearch, memberQuery, updateMemberParams]);

    return (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_560px]">
            <Card className="border-border/60 transition-all hover:border-primary/40 hover:shadow-md">
                <CardHeader className="pb-3">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Users className="size-5 text-primary" />
                                Members
                            </CardTitle>
                            <CardDescription>
                                Search, filter, and remove group members.
                            </CardDescription>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {countSummary(group).map((item) => (
                                <div
                                    key={item.label}
                                    className="rounded-lg border px-3 py-2 text-center"
                                >
                                    <p className="text-lg font-semibold">{item.value}</p>
                                    <p className="text-[11px] text-muted-foreground">
                                        {item.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
                        <div className="relative min-w-0 flex-1">
                            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={memberSearch}
                                onChange={(event) => setMemberSearch(event.target.value)}
                                placeholder="Search users in this group"
                                className="pl-9"
                            />
                        </div>
                        <Select
                            value={memberRole}
                            onValueChange={(value) =>
                                updateMemberParams({
                                    member_role: value === "all" ? null : value,
                                    member_page: "1",
                                })
                            }
                        >
                            <SelectTrigger className="w-full lg:w-44">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="all">All roles</SelectItem>
                                    <SelectItem value={UserRole.manager}>Managers</SelectItem>
                                    <SelectItem value={UserRole.instructor}>Instructors</SelectItem>
                                    <SelectItem value={UserRole.student}>Students</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col gap-2">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <Skeleton key={index} className="h-14 rounded-lg" />
                            ))}
                        </div>
                    ) : isError ? (
                        <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-8 text-center">
                            <AlertCircle className="size-8 text-destructive" />
                            <p className="font-semibold text-destructive">Failed to load members</p>
                            <p className="text-sm text-muted-foreground">
                                {getErrorMessage(error, "Please try again.")}
                            </p>
                            <Button variant="outline" onClick={() => refetch()}>
                                Retry
                            </Button>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-muted-foreground">
                            <Users className="size-9 opacity-40" />
                            <p className="text-sm font-medium">No users in this group</p>
                            <p className="max-w-sm text-center text-xs">
                                Search people on the right and add multiple users at once.
                            </p>
                        </div>
                    ) : (
                        <div className="rounded-lg border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Phone</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow
                                            key={user.id}
                                            className="group cursor-pointer hover:bg-muted/40 transition-colors"
                                        >
                                            <TableCell>
                                                <div className="flex min-w-0 items-center gap-3">
                                                    <Avatar>
                                                        <AvatarFallback className="text-xs">
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
                                                <RoleBadge role={user.role} />
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {user.phone_no || "Not added"}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-muted-foreground hover:text-destructive"
                                                    disabled={isRemoving}
                                                    onClick={() =>
                                                        removeUsers({
                                                            audienceId: group.id,
                                                            data: { user_ids: [user.user_id] },
                                                        })
                                                    }
                                                >
                                                    <Trash2 />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {pagination && pagination.total_pages > 1 && (
                        <AppPagination
                            currentPage={pagination.page}
                            totalPages={pagination.total_pages}
                            hasPrevious={pagination.has_previous}
                            hasNext={pagination.has_next}
                            onPageChange={(page) =>
                                updateMemberParams({ member_page: String(page) })
                            }
                        />
                    )}
                </CardContent>
            </Card>
            <PeoplePicker group={group} currentUsers={users} />
        </div>
    );
}

export function GroupDetailClient({ groupId }: { groupId: string }) {
    const { data, isLoading, isError, error, refetch } =
        useGetAudienceApiV1AudiencesAudienceIdGet(groupId);
    const group = data?.data ?? null;

    if (isLoading) {
        return (
            <div className="flex flex-col gap-5">
                <Skeleton className="h-24 rounded-lg" />
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_560px]">
                    <Skeleton className="h-[520px] rounded-lg" />
                    <Skeleton className="h-[520px] rounded-lg" />
                </div>
            </div>
        );
    }

    if (isError || !group) {
        return (
            <div className="flex min-h-[360px] flex-col items-center justify-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-8 text-center">
                <AlertCircle className="size-9 text-destructive" />
                <p className="font-semibold text-destructive">Failed to load group</p>
                <p className="text-sm text-muted-foreground">
                    {getErrorMessage(error, "Please try again.")}
                </p>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => refetch()}>
                        Retry
                    </Button>
                    <Button asChild>
                        <Link href="/groups">Back to Groups</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
                        <Link href="/groups">
                            <ArrowLeft data-icon="inline-start" />
                            Groups
                        </Link>
                    </Button>
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-2xl font-bold tracking-tight">{group.name}</h1>
                        <Badge variant="secondary">{TYPE_LABELS[group.audience_type]}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {group.description || "Manage group membership and access."}
                    </p>
                </div>
                <div className="rounded-lg border px-4 py-3">
                    <p className="text-2xl font-semibold">{group.total_users ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Total users</p>
                </div>
            </div>

            <GroupMembers group={group} />
        </div>
    );
}
