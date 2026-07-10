"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import {
    AlertCircle,
    ChevronRight,
    Loader2,
    Pencil,
    Plus,
    Search,
    Trash2,
    Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import {
    getListAudiencesApiV1AudiencesGetQueryKey,
    useCreateAudienceApiV1AudiencesPost,
    useDeleteAudienceApiV1AudiencesAudienceIdDelete,
    useListAudiencesApiV1AudiencesGet,
    useUpdateAudienceApiV1AudiencesAudienceIdPatch,
} from "@/api/generated/audiences/audiences";
import { type AudienceResponse, AudienceType } from "@/api/generated/model";
import { AppPagination } from "@/components/shared/app-pagination";
import { EmptyState } from "@/components/shared/empty-state";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
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
import { Textarea } from "@/components/ui/textarea";
import { useDebounce } from "@/hooks/use-debounce";
import { toApiError } from "@/lib/api/error";

const groupSchema = z.object({
    name: z.string().min(1, "Group name is required").max(255),
    audience_type: z.nativeEnum(AudienceType),
    description: z.string().nullish(),
});

type GroupFormValues = z.infer<typeof groupSchema>;

const TYPE_LABELS: Record<AudienceType, string> = {
    [AudienceType.class]: "Class",
    [AudienceType.department]: "Department",
    [AudienceType.batch]: "Batch",
    [AudienceType.campus]: "Campus",
};

function getGroupFormValues(group?: AudienceResponse | null): GroupFormValues {
    return {
        name: group?.name ?? "",
        audience_type: group?.audience_type ?? AudienceType.class,
        description: group?.description ?? "",
    };
}

function getErrorMessage(error: unknown, fallback: string) {
    return toApiError(error).message || fallback;
}

interface GroupDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    group?: AudienceResponse | null;
}

function GroupDialog({ open, onOpenChange, group }: GroupDialogProps) {
    const queryClient = useQueryClient();
    const isEdit = !!group;

    const form = useForm<GroupFormValues>({
        resolver: zodResolver(groupSchema),
        defaultValues: getGroupFormValues(group),
    });

    useEffect(() => {
        if (!open) return;
        form.reset(getGroupFormValues(group));
    }, [form, group, open]);

    const { mutate: createGroup, isPending: isCreating } = useCreateAudienceApiV1AudiencesPost({
        mutation: {
            onSuccess: () => {
                toast.success("Group created");
                onOpenChange(false);
                form.reset();
                queryClient.invalidateQueries({
                    queryKey: getListAudiencesApiV1AudiencesGetQueryKey(),
                });
            },
            onError: (error) => toast.error(getErrorMessage(error, "Failed to create group")),
        },
    });

    const { mutate: updateGroup, isPending: isUpdating } =
        useUpdateAudienceApiV1AudiencesAudienceIdPatch({
            mutation: {
                onSuccess: () => {
                    toast.success("Group updated");
                    onOpenChange(false);
                    queryClient.invalidateQueries({
                        queryKey: getListAudiencesApiV1AudiencesGetQueryKey(),
                    });
                },
                onError: (error) => toast.error(getErrorMessage(error, "Failed to update group")),
            },
        });

    const isPending = isCreating || isUpdating;

    function onSubmit(values: GroupFormValues) {
        if (group) {
            updateGroup({ audienceId: group.id, data: values });
            return;
        }
        createGroup({ data: values });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit group" : "Create group"}</DialogTitle>
                    <DialogDescription>
                        Groups can contain managers, instructors, and students.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Group name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="CSE 2026 Batch A" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="audience_type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Group type</FormLabel>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectItem value={AudienceType.class}>
                                                    Class
                                                </SelectItem>
                                                <SelectItem value={AudienceType.batch}>
                                                    Batch
                                                </SelectItem>
                                                <SelectItem value={AudienceType.department}>
                                                    Department
                                                </SelectItem>
                                                <SelectItem value={AudienceType.campus}>
                                                    Campus
                                                </SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            rows={3}
                                            className="resize-none"
                                            placeholder="Optional context for admins"
                                            {...field}
                                            value={field.value ?? ""}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isPending}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending && (
                                    <Loader2 data-icon="inline-start" className="animate-spin" />
                                )}
                                {isEdit ? "Save changes" : "Create group"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

export function GroupsClient() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();
    const query = searchParams.get("q") ?? "";
    const [search, setSearch] = useState(query);
    const [createOpen, setCreateOpen] = useState(false);
    const [editGroup, setEditGroup] = useState<AudienceResponse | null>(null);
    const [deleteGroupTarget, setDeleteGroupTarget] = useState<AudienceResponse | null>(null);
    const debouncedSearch = useDebounce(search, 400);

    const page = Number.parseInt(searchParams.get("page") ?? "1", 10) || 1;

    const { data, isLoading, isError, error, refetch } = useListAudiencesApiV1AudiencesGet({
        page,
        page_size: 10,
        q: query || undefined,
    });

    const { mutate: deleteGroup, isPending: isDeleting } =
        useDeleteAudienceApiV1AudiencesAudienceIdDelete({
            mutation: {
                onSuccess: () => {
                    toast.success("Group deleted");
                    queryClient.invalidateQueries({
                        queryKey: getListAudiencesApiV1AudiencesGetQueryKey(),
                    });
                },
                onError: (deleteError) =>
                    toast.error(getErrorMessage(deleteError, "Failed to delete group")),
            },
        });

    const groups = data?.data ?? [];
    const pagination = data?.pagination;

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

    function confirmDelete(group: AudienceResponse) {
        setDeleteGroupTarget(group);
    }

    return (
        <div className="grid grid-cols-1 gap-5">
            <Card className="border-border/60">
                <CardHeader className="pb-3">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="size-5 text-primary" />
                                Group Directory
                            </CardTitle>
                            <CardDescription>
                                Open a group to manage managers, instructors, and students.
                            </CardDescription>
                        </div>
                        <Button onClick={() => setCreateOpen(true)}>
                            <Plus data-icon="inline-start" />
                            Create Group
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search groups"
                            className="pl-9"
                        />
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <Skeleton key={index} className="h-28 rounded-lg" />
                            ))}
                        </div>
                    ) : isError ? (
                        <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-8 text-center">
                            <AlertCircle className="size-8 text-destructive" />
                            <p className="font-semibold text-destructive">Failed to load groups</p>
                            <p className="text-sm text-muted-foreground">
                                {getErrorMessage(error, "Please try again.")}
                            </p>
                            <Button variant="outline" onClick={() => refetch()}>
                                Retry
                            </Button>
                        </div>
                    ) : groups.length === 0 ? (
                        <EmptyState
                            icon={Users}
                            title="No groups found"
                            description="Create a group, then open it to add people."
                            compact
                        />
                    ) : (
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {groups.map((group) => (
                                <Card
                                    key={group.id}
                                    className="border-border/60 py-0 transition-all hover:border-primary/40 hover:shadow-md"
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <Link
                                                href={`/groups/${group.id}`}
                                                className="min-w-0 flex-1 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <h2 className="truncate font-semibold">
                                                        {group.name}
                                                    </h2>
                                                    <Badge variant="secondary">
                                                        {TYPE_LABELS[group.audience_type]}
                                                    </Badge>
                                                </div>
                                                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                                                    {group.description || "No description added."}
                                                </p>
                                            </Link>
                                            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                                        </div>
                                        <div className="mt-4 flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Users className="size-4" />
                                                {group.total_users ?? 0} users
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-8"
                                                    onClick={() => setEditGroup(group)}
                                                >
                                                    <Pencil />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-8 text-muted-foreground hover:text-destructive"
                                                    disabled={isDeleting}
                                                    onClick={() => confirmDelete(group)}
                                                >
                                                    <Trash2 />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {pagination && pagination.total_pages > 1 && (
                        <AppPagination
                            currentPage={pagination.page}
                            totalPages={pagination.total_pages}
                            hasPrevious={pagination.has_previous}
                            hasNext={pagination.has_next}
                            onPageChange={(nextPage) => updateParams({ page: String(nextPage) })}
                        />
                    )}
                </CardContent>
            </Card>

            <GroupDialog open={createOpen} onOpenChange={setCreateOpen} />
            <GroupDialog
                open={!!editGroup}
                onOpenChange={(open) => !open && setEditGroup(null)}
                group={editGroup}
            />

            <AlertDialog
                open={!!deleteGroupTarget}
                onOpenChange={(open) => !open && setDeleteGroupTarget(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Group</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete &ldquo;{deleteGroupTarget?.name}&rdquo;?
                            This will remove its membership links.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            onClick={(e) => {
                                e.preventDefault();
                                if (deleteGroupTarget) {
                                    deleteGroup(
                                        {
                                            audienceId: deleteGroupTarget.id,
                                        },
                                        {
                                            onSuccess: () => {
                                                setDeleteGroupTarget(null);
                                            },
                                        },
                                    );
                                }
                            }}
                            disabled={isDeleting}
                        >
                            {isDeleting && (
                                <Loader2
                                    data-icon="inline-start"
                                    className="mr-2 h-4 w-4 animate-spin"
                                />
                            )}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
