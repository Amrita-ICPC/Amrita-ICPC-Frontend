"use client";

import { useState } from "react";
import { Loader2, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
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
import { useAddAudienceUsers } from "@/query/audience-query";
import { useUsers } from "@/query/user-query";
import { toast } from "@/lib/hooks/use-toast";
import { toApiError } from "@/lib/api/error";
import type { UserRole } from "@/api/generated/model";

interface AddAudienceUsersDialogProps {
    audienceId: string;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AddAudienceUsersDialog({
    audienceId,
    isOpen,
    onOpenChange,
}: AddAudienceUsersDialogProps) {
    const [localSearch, setLocalSearch] = useState("");
    const debouncedSearch = useDebounce(localSearch, 300);
    const [roleFilter, setRoleFilter] = useState<string>("all");
    const [page, setPage] = useState(1);
    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

    const resetDialogState = () => {
        setSelectedUsers(new Set());
        setLocalSearch("");
        setRoleFilter("all");
        setPage(1);
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) resetDialogState();
        onOpenChange(open);
    };

    const {
        data: usersResponse,
        isLoading,
        isError,
        error,
        refetch,
    } = useUsers({
        page,
        page_size: 5,
        ...(roleFilter !== "all" && { role: roleFilter as UserRole }),
        ...(debouncedSearch && { q: debouncedSearch }),
    });

    const addUsersMutation = useAddAudienceUsers();

    const users = usersResponse?.data ?? [];
    const pagination = usersResponse?.pagination;

    const selectableUsers = users;
    const allCurrentSelected =
        selectableUsers.length > 0 && selectableUsers.every((u) => selectedUsers.has(u.id));

    const toggleAll = () => {
        const next = new Set(selectedUsers);
        if (allCurrentSelected) {
            selectableUsers.forEach((u) => next.delete(u.id));
        } else {
            selectableUsers.forEach((u) => next.add(u.id));
        }
        setSelectedUsers(next);
    };

    const toggleUser = (userId: string) => {
        const next = new Set(selectedUsers);
        if (next.has(userId)) {
            next.delete(userId);
        } else {
            next.add(userId);
        }
        setSelectedUsers(next);
    };

    const handleAddUsers = async () => {
        if (selectedUsers.size === 0) return;
        try {
            await addUsersMutation.mutateAsync({
                audienceId,
                payload: {
                    user_ids: Array.from(selectedUsers),
                },
            });
            toast(`Successfully added ${selectedUsers.size} user(s) to the audience.`);
            onOpenChange(false);

            // Reset state upon successful add
            setSelectedUsers(new Set());
            setLocalSearch("");
            setRoleFilter("all");
            setPage(1);
        } catch (err: unknown) {
            const apiError = toApiError(err);
            toast(apiError.detail ?? apiError.message ?? "Failed to add users");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-3xl flex flex-col gap-0 p-0 overflow-hidden shadow-2xl rounded-xl border-border bg-background">
                <DialogHeader className="px-6 py-6 pb-4">
                    <DialogTitle className="text-xl font-semibold tracking-tight text-foreground">
                        Add Users to Audience
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground mt-1.5">
                        Search and select multiple users to instantly add them to this audience
                        group.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col sm:flex-row items-center gap-3 px-6 py-4 border-b border-border bg-muted/30">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-muted-foreground/70" />
                        <Input
                            placeholder="Search by name, email or phone..."
                            className="pl-10 shadow-sm h-10 border-border bg-background"
                            value={localSearch}
                            onChange={(e) => {
                                setLocalSearch(e.target.value);
                                setPage(1);
                            }}
                        />
                    </div>
                    <Select
                        value={roleFilter}
                        onValueChange={(v) => {
                            setRoleFilter(v);
                            setPage(1);
                        }}
                    >
                        <SelectTrigger className="w-full sm:w-[180px] shadow-sm border-border h-10 bg-background">
                            <SelectValue placeholder="All Roles" />
                        </SelectTrigger>
                        <SelectContent className="shadow-lg border-border">
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="instructor">Instructor</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="px-6 py-4 flex-1 overflow-auto bg-muted/10 min-h-[300px]">
                    <div className="rounded-xl border shadow-sm border-border bg-card overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/40 border-b border-border">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-[50px] text-center pl-4">
                                        <Checkbox
                                            checked={allCurrentSelected}
                                            onCheckedChange={toggleAll}
                                            disabled={isLoading || users.length === 0}
                                            className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground border-primary/40"
                                        />
                                    </TableHead>
                                    <TableHead className="font-semibold text-foreground">
                                        User
                                    </TableHead>
                                    <TableHead className="font-semibold text-foreground">
                                        Email
                                    </TableHead>
                                    <TableHead className="font-semibold text-foreground">
                                        Role
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow
                                            key={i}
                                            className="border-b border-border/60 last:border-0 hover:bg-transparent"
                                        >
                                            <TableCell className="w-[50px] text-center pl-4">
                                                <Skeleton className="h-4 w-4 rounded-sm mx-auto" />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-2">
                                                    <Skeleton className="h-4 w-32" />
                                                    <Skeleton className="h-3 w-20" />
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-4 w-48" />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-[22px] w-[70px] rounded-full" />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : isError ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-40 text-center">
                                            <div className="flex flex-col gap-2 items-center justify-center text-destructive/90">
                                                <p className="font-medium text-destructive">
                                                    Failed to load users
                                                </p>
                                                <p className="text-sm opacity-80">
                                                    {toApiError(error).message}
                                                </p>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setPage(1);
                                                        void refetch();
                                                    }}
                                                    className="mt-2 h-8"
                                                >
                                                    Retry
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : users.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-40 text-center">
                                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                                                <Search className="h-8 w-8 mb-3 opacity-20" />
                                                <p>No users found matching your search</p>
                                                <p className="text-sm opacity-70 mt-1">
                                                    Try adjusting your filters or query
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.map((user) => {
                                        const isSelected = selectedUsers.has(user.id);

                                        return (
                                            <TableRow
                                                key={user.id}
                                                className={`border-b border-border/60 last:border-0 cursor-pointer transition-colors ${
                                                    isSelected
                                                        ? "bg-primary/5 hover:bg-primary/10"
                                                        : "hover:bg-muted/50"
                                                }`}
                                                onClick={() => toggleUser(user.id)}
                                            >
                                                <TableCell className="w-[50px] text-center pl-4">
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onCheckedChange={() => toggleUser(user.id)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="data-[state=checked]:bg-primary border-primary/40"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className="font-semibold text-sm text-foreground">
                                                            {user.name}
                                                        </div>
                                                    </div>
                                                    <div className="text-[13px] text-muted-foreground mt-0.5">
                                                        {user.user_id}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {user.email}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="secondary"
                                                        className="capitalize text-xs font-medium border-transparent shadow-none"
                                                    >
                                                        {user.role}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                <div className="px-6 py-3 border-t border-border bg-muted/20 flex items-center justify-between">
                    <div className="text-[13px] font-medium text-muted-foreground">
                        {pagination?.total ? (
                            <>
                                Showing{" "}
                                <span className="text-foreground">{(page - 1) * 5 + 1}</span> to{" "}
                                <span className="text-foreground">
                                    {Math.min(page * 5, pagination.total)}
                                </span>{" "}
                                of <span className="text-foreground">{pagination.total}</span>{" "}
                                results
                            </>
                        ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-3 text-xs shadow-sm bg-background border-border"
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page <= 1 || isLoading}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-4 text-xs shadow-sm bg-background border-border"
                            onClick={() => setPage(page + 1)}
                            disabled={!pagination?.has_next || isLoading}
                        >
                            Next
                        </Button>
                    </div>
                </div>

                <DialogFooter className="px-6 py-4 border-t border-border bg-background flex flex-row items-center justify-between sm:justify-between w-full">
                    <div className="text-sm font-medium text-foreground">
                        {selectedUsers.size > 0 ? (
                            <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-md text-xs font-semibold">
                                {selectedUsers.size} user{selectedUsers.size > 1 ? "s" : ""}{" "}
                                selected
                            </span>
                        ) : (
                            <span className="text-muted-foreground text-xs">No users selected</span>
                        )}
                    </div>
                    <div className="flex flex-row items-center gap-2">
                        <Button
                            variant="ghost"
                            className="font-medium hover:bg-muted/50"
                            onClick={() => handleOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAddUsers}
                            disabled={selectedUsers.size === 0 || addUsersMutation.isPending}
                            className="w-32 font-semibold shadow-md transition-all active:scale-[0.98]"
                        >
                            {addUsersMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Adding...
                                </>
                            ) : (
                                "Add Users"
                            )}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
