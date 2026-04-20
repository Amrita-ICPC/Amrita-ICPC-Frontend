"use client";

import { useState } from "react";
import { Search, Trash2 } from "lucide-react";

import type { UserRole } from "@/api/generated/model";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
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

type RoleFilter = UserRole | "all";

type AudienceUserRow = {
    id: string;
    name: string;
    email: string;
    user_id: string;
    role: UserRole;
    phone_no?: string | null;
};

type PaginationModel = {
    page: number;
    total_pages: number;
    has_previous: boolean;
    has_next: boolean;
};

function formatRole(value: string) {
    return value.replace(/_/g, " ").toUpperCase();
}

export function AudienceUsersTableCard({
    isLoading,
    isFetching,
    error,
    roleFilter,
    onRoleChange,
    localSearch,
    onLocalSearchChange,
    users,
    pagination,
    onPageChange,
    onRemoveUsers,
    isRemovingUsers,
}: {
    isLoading: boolean;
    isFetching: boolean;
    error: { status?: number; message: string; detail?: string | null } | null;
    roleFilter: RoleFilter;
    onRoleChange: (next: RoleFilter) => void;
    localSearch: string;
    onLocalSearchChange: (next: string) => void;
    users: AudienceUserRow[];
    pagination: PaginationModel | null;
    onPageChange: (page: number) => void;
    onRemoveUsers: (userIds: string[]) => Promise<boolean | void>;
    isRemovingUsers: boolean;
}) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const totalPages = pagination?.total_pages || 1;
    const currentPage = pagination?.page || 1;

    const allCurrentSelected = users.length > 0 && users.every((u) => selectedIds.has(u.id));

    const toggleAll = () => {
        const next = new Set(selectedIds);
        if (allCurrentSelected) {
            users.forEach((u) => next.delete(u.id));
        } else {
            users.forEach((u) => next.add(u.id));
        }
        setSelectedIds(next);
    };

    const toggleUser = (userId: string) => {
        const next = new Set(selectedIds);
        if (next.has(userId)) next.delete(userId);
        else next.add(userId);
        setSelectedIds(next);
    };

    const handleBulkRemove = async () => {
        if (selectedIds.size === 0) return;
        const success = await onRemoveUsers(Array.from(selectedIds));
        if (success !== false) {
            setSelectedIds(new Set());
        }
    };

    return (
        <Card>
            <CardHeader className="space-y-4 border-b pb-5">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-base">Users</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Members currently present in this audience.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {selectedIds.size > 0 ? (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleBulkRemove}
                                disabled={isRemovingUsers}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {isRemovingUsers
                                    ? "Removing..."
                                    : `Remove Selected (${selectedIds.size})`}
                            </Button>
                        ) : null}
                        {isFetching && !isLoading ? (
                            <p className="text-xs text-muted-foreground mr-2">Updating…</p>
                        ) : null}
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-1.5 md:col-span-2">
                        <Label htmlFor="audience-users-search">Search members</Label>
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="audience-users-search"
                                value={localSearch}
                                onChange={(e) => onLocalSearchChange(e.target.value)}
                                placeholder="Search by name, email, or user id..."
                                className="pl-9"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label>Role filter</Label>
                        <Select
                            value={roleFilter}
                            onValueChange={(v) => onRoleChange(v as RoleFilter)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="All roles" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All roles</SelectItem>
                                <SelectItem value="student">Student</SelectItem>
                                <SelectItem value="instructor">Instructor</SelectItem>
                                <SelectItem value="manager">Manager</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                {isLoading ? (
                    <div className="px-6 py-6">
                        <div className="space-y-2">
                            <Skeleton className="h-9 w-full" />
                            <Skeleton className="h-9 w-full" />
                            <Skeleton className="h-9 w-full" />
                        </div>
                    </div>
                ) : error ? (
                    <div className="px-6 py-10 text-center">
                        <p className="text-sm font-medium">Failed to load users</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {error.status ? `Status: ${error.status}. ` : ""}
                            {error.detail ?? error.message}
                        </p>
                    </div>
                ) : users.length === 0 ? (
                    <div className="px-6 py-10 text-center text-sm text-muted-foreground">
                        No users found.
                    </div>
                ) : (
                    <Table className="min-w-[760px] [&_thead_tr]:bg-muted/30 [&_th]:px-6 [&_td]:px-6 [&_th]:py-3 [&_td]:py-3">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px] text-center pl-4">
                                    <Checkbox
                                        checked={allCurrentSelected}
                                        onCheckedChange={toggleAll}
                                        disabled={isLoading || users.length === 0}
                                    />
                                </TableHead>
                                <TableHead className="w-[220px]">Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead className="w-[140px] text-right">Phone</TableHead>
                                <TableHead className="w-[140px] text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((u) => {
                                const isSelected = selectedIds.has(u.id);
                                return (
                                    <TableRow
                                        key={u.id}
                                        className={isSelected ? "bg-muted/50" : ""}
                                    >
                                        <TableCell className="w-[50px] text-center pl-4">
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={() => toggleUser(u.id)}
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            <span className="block max-w-[220px] truncate">
                                                {u.name}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {u.email}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="text-[11px]">
                                                {formatRole(String(u.role))}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground">
                                            {u.phone_no ?? "—"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                disabled={isRemovingUsers}
                                                className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 px-2"
                                                onClick={async () => {
                                                    // Immediately remove just this one, skipping mass selection
                                                    const success = await onRemoveUsers([u.id]);
                                                    if (success !== false) {
                                                        setSelectedIds((previous) => {
                                                            const next = new Set(previous);
                                                            next.delete(u.id);
                                                            return next;
                                                        });
                                                    }
                                                }}
                                            >
                                                <Trash2 className="h-3.5 w-3.5 mr-1" />
                                                Remove
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                )}
            </CardContent>

            {pagination ? (
                <div className="flex items-center justify-between gap-4 border-t px-6 py-4">
                    <p className="text-sm text-muted-foreground">
                        Page {pagination.page} of {pagination.total_pages}
                    </p>

                    <Pagination className="justify-end">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (pagination.has_previous) onPageChange(currentPage - 1);
                                    }}
                                    className={
                                        !pagination.has_previous
                                            ? "pointer-events-none opacity-50"
                                            : ""
                                    }
                                />
                            </PaginationItem>

                            {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                                let pageNum = currentPage;
                                if (totalPages <= 5) pageNum = idx + 1;
                                else if (currentPage <= 3) pageNum = idx + 1;
                                else if (currentPage >= totalPages - 2)
                                    pageNum = totalPages - 4 + idx;
                                else pageNum = currentPage - 2 + idx;

                                return (
                                    <PaginationItem key={pageNum}>
                                        <PaginationLink
                                            href="#"
                                            isActive={pageNum === currentPage}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                onPageChange(pageNum);
                                            }}
                                        >
                                            {pageNum}
                                        </PaginationLink>
                                    </PaginationItem>
                                );
                            })}

                            <PaginationItem>
                                <PaginationNext
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (pagination.has_next) onPageChange(currentPage + 1);
                                    }}
                                    className={
                                        !pagination.has_next ? "pointer-events-none opacity-50" : ""
                                    }
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            ) : null}
        </Card>
    );
}
