"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Users, Mail, ChevronRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import * as z from "zod";

import {
    useListAudiencesApiV1AudiencesGet,
    useCreateAudienceApiV1AudiencesPost,
    useUpdateAudienceApiV1AudiencesAudienceIdPatch,
    useDeleteAudienceApiV1AudiencesAudienceIdDelete,
    useAddUsersToAudienceByEmailApiV1AudiencesAudienceIdUsersEmailPost,
    useListAudienceUsersApiV1AudiencesAudienceIdUsersGet,
    useRemoveUsersFromAudienceApiV1AudiencesAudienceIdUsersDelete,
    getListAudiencesApiV1AudiencesGetQueryKey,
    getListAudienceUsersApiV1AudiencesAudienceIdUsersGetQueryKey,
} from "@/api/generated/audiences/audiences";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { AudienceResponse } from "@/api/generated/model";
import { AudienceType } from "@/api/generated/model/audienceType";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
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
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AppPagination } from "@/components/shared/app-pagination";

// ─── Zod schemas ─────────────────────────────────────────────────────────────

const audienceSchema = z.object({
    name: z.string().min(1, "Name is required").max(255),
    audience_type: z.nativeEnum(AudienceType),
    description: z.string().nullable().optional(),
});

type AudienceFormValues = z.infer<typeof audienceSchema>;

// ─── Audience Form Dialog ────────────────────────────────────────────────────

interface AudienceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    audience?: AudienceResponse;
}

function AudienceDialog({ open, onOpenChange, audience }: AudienceDialogProps) {
    const queryClient = useQueryClient();
    const isEdit = !!audience;

    const form = useForm<AudienceFormValues>({
        resolver: zodResolver(audienceSchema),
        values: {
            name: audience?.name ?? "",
            audience_type: audience?.audience_type ?? AudienceType.class,
            description: audience?.description ?? "",
        },
    });

    const { mutate: create, isPending: creating } = useCreateAudienceApiV1AudiencesPost({
        mutation: {
            onSuccess: () => {
                toast.success("Audience created");
                onOpenChange(false);
                form.reset();
                queryClient.invalidateQueries({
                    queryKey: getListAudiencesApiV1AudiencesGetQueryKey(),
                });
            },
            onError: (err: unknown) => {
                const msg = (err as { response?: { data?: { message?: string } } })?.response?.data
                    ?.message;
                toast.error(msg || "Failed to create audience");
            },
        },
    });

    const { mutate: update, isPending: updating } = useUpdateAudienceApiV1AudiencesAudienceIdPatch({
        mutation: {
            onSuccess: () => {
                toast.success("Audience updated");
                onOpenChange(false);
                queryClient.invalidateQueries({
                    queryKey: getListAudiencesApiV1AudiencesGetQueryKey(),
                });
            },
            onError: (err: unknown) => {
                const msg = (err as { response?: { data?: { message?: string } } })?.response?.data
                    ?.message;
                toast.error(msg || "Failed to update audience");
            },
        },
    });

    const isPending = creating || updating;

    function onSubmit(values: AudienceFormValues) {
        if (isEdit) {
            update({ audienceId: audience!.id, data: values });
        } else {
            create({ data: values });
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[460px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit Audience" : "Create Audience"}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. CSE Batch 2024" {...field} />
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
                                    <FormLabel>Type</FormLabel>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value={AudienceType.class}>
                                                Class
                                            </SelectItem>
                                            <SelectItem value={AudienceType.department}>
                                                Department
                                            </SelectItem>
                                            <SelectItem value={AudienceType.batch}>
                                                Batch
                                            </SelectItem>
                                            <SelectItem value={AudienceType.campus}>
                                                Campus
                                            </SelectItem>
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
                                    <FormLabel>Description (optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Brief description…"
                                            className="resize-none"
                                            rows={3}
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
                                {isPending ? "Saving…" : isEdit ? "Save Changes" : "Create"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

// ─── Users Panel ─────────────────────────────────────────────────────────────

function AudienceUsersPanel({
    audience,
    onClose,
}: {
    audience: AudienceResponse;
    onClose: () => void;
}) {
    const [emailInput, setEmailInput] = useState("");
    const [page, setPage] = useState(1);
    const queryClient = useQueryClient();

    const { data, isLoading } = useListAudienceUsersApiV1AudiencesAudienceIdUsersGet(audience.id, {
        page,
        page_size: 20,
    });
    const users = data?.data?.users ?? [];
    const pagination = data?.pagination;

    const { mutate: addByEmail, isPending: adding } =
        useAddUsersToAudienceByEmailApiV1AudiencesAudienceIdUsersEmailPost({
            mutation: {
                onSuccess: () => {
                    toast.success("User added");
                    setEmailInput("");
                    queryClient.invalidateQueries({
                        queryKey: getListAudienceUsersApiV1AudiencesAudienceIdUsersGetQueryKey(
                            audience.id,
                        ),
                    });
                    queryClient.invalidateQueries({
                        queryKey: getListAudiencesApiV1AudiencesGetQueryKey(),
                    });
                },
                onError: (err: unknown) => {
                    const msg = (err as { response?: { data?: { message?: string } } })?.response
                        ?.data?.message;
                    toast.error(msg || "Failed to add user");
                },
            },
        });

    const { mutate: removeUsers, isPending: removing } =
        useRemoveUsersFromAudienceApiV1AudiencesAudienceIdUsersDelete({
            mutation: {
                onSuccess: () => {
                    toast.success("User removed");
                    queryClient.invalidateQueries({
                        queryKey: getListAudienceUsersApiV1AudiencesAudienceIdUsersGetQueryKey(
                            audience.id,
                        ),
                    });
                    queryClient.invalidateQueries({
                        queryKey: getListAudiencesApiV1AudiencesGetQueryKey(),
                    });
                },
                onError: (err: unknown) => {
                    const msg = (err as { response?: { data?: { message?: string } } })?.response
                        ?.data?.message;
                    toast.error(msg || "Failed to remove user");
                },
            },
        });

    function handleAdd() {
        const emails = emailInput
            .split(/[\s,]+/)
            .map((e) => e.trim())
            .filter(Boolean);
        if (!emails.length) return;
        addByEmail({
            audienceId: audience.id,
            data: { emails },
        });
    }

    return (
        <div className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-semibold">{audience.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                        {audience.audience_type} · {audience.total_users ?? 0} users
                    </p>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose}>
                    Close
                </Button>
            </div>

            <div className="flex gap-2">
                <Input
                    placeholder="Email addresses (comma or space separated)"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAdd())}
                />
                <Button
                    onClick={handleAdd}
                    disabled={adding || !emailInput.trim()}
                    className="shrink-0"
                >
                    <Mail className="mr-1.5 h-4 w-4" />
                    Add
                </Button>
            </div>

            <ScrollArea className="h-[280px]">
                {isLoading ? (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                        Loading…
                    </div>
                ) : users.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                        No users yet.
                    </div>
                ) : (
                    <div className="space-y-1">
                        {users.map((u) => (
                            <div
                                key={u.id}
                                className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-muted/50"
                            >
                                <div className="min-w-0">
                                    <p className="text-sm font-medium truncate">
                                        {u.name || u.email || u.id}
                                    </p>
                                    {u.name && u.email && (
                                        <p className="text-xs text-muted-foreground truncate">
                                            {u.email}
                                        </p>
                                    )}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                                    disabled={removing}
                                    onClick={() =>
                                        removeUsers({
                                            audienceId: audience.id,
                                            data: { user_ids: [u.user_id] },
                                        })
                                    }
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </ScrollArea>

            {pagination && (
                <div className="pt-2">
                    <AppPagination
                        currentPage={pagination.page}
                        totalPages={pagination.total_pages}
                        hasNext={pagination.has_next}
                        hasPrevious={pagination.has_previous}
                        onPageChange={setPage}
                    />
                </div>
            )}
        </div>
    );
}

// ─── Main Client ──────────────────────────────────────────────────────────────

export function AudiencesClient() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();

    const [createOpen, setCreateOpen] = useState(false);
    const [editAudience, setEditAudience] = useState<AudienceResponse | null>(null);
    const [selectedAudience, setSelectedAudience] = useState<AudienceResponse | null>(null);

    const page = parseInt(searchParams.get("page") || "1");

    const { data, isLoading, isError } = useListAudiencesApiV1AudiencesGet({
        page,
        page_size: 10,
    });
    const audiences = data?.data ?? [];
    const pagination = data?.pagination;

    const { mutate: deleteAudience } = useDeleteAudienceApiV1AudiencesAudienceIdDelete({
        mutation: {
            onSuccess: () => {
                toast.success("Audience deleted");
                setSelectedAudience(null);
                queryClient.invalidateQueries({
                    queryKey: getListAudiencesApiV1AudiencesGetQueryKey(),
                });
            },
            onError: (err: unknown) => {
                const msg = (err as { response?: { data?: { message?: string } } })?.response?.data
                    ?.message;
                toast.error(msg || "Failed to delete audience");
            },
        },
    });

    function handleDelete(audience: AudienceResponse) {
        if (!confirm(`Delete "${audience.name}"? This cannot be undone.`)) return;
        deleteAudience({ audienceId: audience.id });
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button onClick={() => setCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Audience
                </Button>
            </div>

            {isLoading ? (
                <div className="flex min-h-[200px] items-center justify-center text-sm text-muted-foreground">
                    Loading…
                </div>
            ) : isError ? (
                <div className="flex min-h-[200px] items-center justify-center text-sm text-destructive">
                    Failed to load audiences.
                </div>
            ) : audiences.length === 0 ? (
                <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-muted-foreground">
                    <Users className="h-8 w-8 opacity-40" />
                    <p className="text-sm">No audiences yet. Create one to get started.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="rounded-lg border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Users</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {audiences.map((audience) => (
                                    <TableRow
                                        key={audience.id}
                                        className={
                                            selectedAudience?.id === audience.id
                                                ? "bg-muted/50"
                                                : ""
                                        }
                                    >
                                        <TableCell className="font-medium">
                                            {audience.name}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="capitalize">
                                                {audience.audience_type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {audience.total_users ?? 0}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm truncate max-w-[200px]">
                                            {audience.description || "—"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() =>
                                                        setSelectedAudience(
                                                            selectedAudience?.id === audience.id
                                                                ? null
                                                                : audience,
                                                        )
                                                    }
                                                    title="Manage users"
                                                >
                                                    <ChevronRight
                                                        className={`h-4 w-4 transition-transform ${selectedAudience?.id === audience.id ? "rotate-90" : ""}`}
                                                    />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => setEditAudience(audience)}
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                    onClick={() => handleDelete(audience)}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {pagination && (
                        <AppPagination
                            currentPage={pagination.page}
                            totalPages={pagination.total_pages}
                            hasNext={pagination.has_next}
                            hasPrevious={pagination.has_previous}
                            onPageChange={(p) => {
                                const params = new URLSearchParams(searchParams.toString());
                                params.set("page", String(p));
                                router.push(`${pathname}?${params.toString()}`);
                            }}
                        />
                    )}

                    {selectedAudience && (
                        <AudienceUsersPanel
                            audience={selectedAudience}
                            onClose={() => setSelectedAudience(null)}
                        />
                    )}
                </div>
            )}

            <AudienceDialog open={createOpen} onOpenChange={setCreateOpen} />
            {editAudience && (
                <AudienceDialog
                    open={!!editAudience}
                    onOpenChange={(open) => !open && setEditAudience(null)}
                    audience={editAudience}
                />
            )}
        </div>
    );
}
