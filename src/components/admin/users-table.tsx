"use client";

/**
 * Users management table with TanStack Table
 * Supports pagination, sorting, and basic admin operations
 */

import { useState } from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    PaginationState,
} from "@tanstack/react-table";
import { usePaginatedUsers, useDeleteUser } from "@/query/use-paginated-users";
import { UserProfile } from "@/services/users";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, Loader2, Trash2 } from "lucide-react";

const columns: ColumnDef<UserProfile>[] = [
    {
        accessorKey: "email",
        header: "Email",
        cell: (info) => <span className="font-medium">{String(info.getValue())}</span>,
    },
    {
        accessorKey: "name",
        header: "Name",
        cell: (info) => String(info.getValue()) || "—",
    },
    {
        accessorKey: "roles",
        header: "Roles",
        cell: (info) => {
            const roles = (info.getValue() as string[] | undefined) || [];
            return (
                <div className="flex gap-1">
                    {roles.length > 0
                        ? roles.map((role) => (
                              <span
                                  key={role}
                                  className="inline-block bg-blue-100 px-2 py-1 text-xs text-blue-800 rounded"
                              >
                                  {role}
                              </span>
                          ))
                        : "—"}
                </div>
            );
        },
    },
    {
        accessorKey: "created_at",
        header: "Created",
        cell: (info) => {
            const date = info.getValue();
            return date ? new Date(String(date)).toLocaleDateString() : "—";
        },
    },
];

interface UsersTableProps {
    onUserSelect?: (user: UserProfile) => void;
}

export function UsersTable({ onUserSelect }: UsersTableProps) {
    const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const pagination = { pageIndex, pageSize };
    const { data, isLoading, error, refetch } = usePaginatedUsers(pagination);
    const deleteUserMutation = useDeleteUser();

    const totalPages = data?.total ? Math.ceil(data.total / pageSize) : 0;

    const columnsWithActions: ColumnDef<UserProfile>[] = [
        ...columns,
        {
            id: "actions",
            header: "Actions",
            cell: (info) => {
                const user = info.row.original;
                return (
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onUserSelect?.(user)}
                            className="text-xs"
                        >
                            View
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                                if (confirm(`Delete user ${user.email}?`)) {
                                    deleteUserMutation.mutate(user.id);
                                }
                            }}
                            disabled={deleteUserMutation.isPending}
                            className="text-xs"
                        >
                            {deleteUserMutation.isPending ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                                <Trash2 className="w-3 h-3" />
                            )}
                        </Button>
                    </div>
                );
            },
        },
    ];

    // eslint-disable-next-line react-hooks/incompatible-library
    const table = useReactTable({
        data: data?.data || [],
        columns: columnsWithActions,
        rowCount: data?.total || 0,
        // ... rest of your config
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        state: {
            pagination,
        },
        onPaginationChange: setPagination,
    });

    if (error) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                    <p className="font-semibold text-red-900">Failed to load users</p>
                    <p className="text-sm text-red-700">{(error as Error)?.message}</p>
                    <Button size="sm" onClick={() => refetch()} className="mt-2">
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        className="px-6 py-3 text-left font-semibold text-gray-700"
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef.header,
                                                  header.getContext(),
                                              )}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td
                                    colSpan={columnsWithActions.length}
                                    className="px-6 py-8 text-center"
                                >
                                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-400" />
                                </td>
                            </tr>
                        ) : table.getRowModel().rows.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columnsWithActions.length}
                                    className="px-6 py-8 text-center text-gray-500"
                                >
                                    No users found
                                </td>
                            </tr>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <tr key={row.id} className="border-b hover:bg-gray-50">
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id} className="px-6 py-3">
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination controls */}
            <div className="flex items-center justify-between border-t bg-gray-50 px-6 py-4">
                <div className="text-sm text-gray-600">
                    Page {pageIndex + 1} of {totalPages}
                    {data?.total && ` • ${data.total} total users`}
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex - 1 }))
                        }
                        disabled={pageIndex === 0 || isLoading}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex + 1 }))
                        }
                        disabled={pageIndex >= totalPages - 1 || isLoading}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </Card>
    );
}
