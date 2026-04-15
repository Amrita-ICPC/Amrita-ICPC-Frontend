"use client";

/**
 * Contests management table with TanStack Table
 * Supports pagination and basic admin operations (edit/delete)
 */

import { useState } from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    PaginationState,
} from "@tanstack/react-table";
import { usePaginatedContests, useDeleteContest } from "@/query/use-paginated-contests";
import { Contest } from "@/services/contests";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, Loader2, Trash2, Edit2 } from "lucide-react";

const columns: ColumnDef<Contest>[] = [
    {
        accessorKey: "name",
        header: "Contest Name",
        cell: (info) => <span className="font-medium">{String(info.getValue())}</span>,
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: (info) => {
            const status = String(info.getValue());
            const statusColors = {
                draft: "bg-gray-100 text-gray-800",
                scheduled: "bg-blue-100 text-blue-800",
                in_progress: "bg-yellow-100 text-yellow-800",
                completed: "bg-green-100 text-green-800",
            };
            return (
                <span
                    className={`inline-block px-2 py-1 text-xs rounded font-semibold ${statusColors[status as keyof typeof statusColors]}`}
                >
                    {status.replace("_", " ")}
                </span>
            );
        },
    },
    {
        accessorKey: "start_time",
        header: "Start",
        cell: (info) => {
            const date = info.getValue();
            return date ? new Date(String(date)).toLocaleDateString() : "—";
        },
    },
    {
        accessorKey: "end_time",
        header: "End",
        cell: (info) => {
            const date = info.getValue();
            return date ? new Date(String(date)).toLocaleDateString() : "—";
        },
    },
    {
        accessorKey: "max_teams",
        header: "Max Teams",
        cell: (info) => String(info.getValue()) || "—",
    },
];

interface ContestsTableProps {
    onEdit?: (contest: Contest) => void;
}

export function ContestsTable({ onEdit }: ContestsTableProps) {
    const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const pagination = { pageIndex, pageSize };
    const { data, isLoading, error, refetch } = usePaginatedContests(pagination);
    const deleteContestMutation = useDeleteContest();

    const totalPages = data?.total ? Math.ceil(data.total / pageSize) : 0;

    const columnsWithActions: ColumnDef<Contest>[] = [
        ...columns,
        {
            id: "actions",
            header: "Actions",
            cell: (info) => {
                const contest = info.row.original;
                return (
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit?.(contest)}
                            className="text-xs"
                        >
                            <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                                if (confirm(`Delete contest "${contest.name}"?`)) {
                                    deleteContestMutation.mutate(contest.id);
                                }
                            }}
                            disabled={deleteContestMutation.isPending}
                            className="text-xs"
                        >
                            {deleteContestMutation.isPending ? (
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

    const table = useReactTable({
        data: data?.data || [],
        columns: columnsWithActions,
        rowCount: data?.total || 0,
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
                    <p className="font-semibold text-red-900">Failed to load contests</p>
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
                                    No contests found
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
                    {data?.total && ` • ${data.total} total contests`}
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
