"use client";

/**
 * Question Banks List Page
 * Displays all question banks created by instructor with summary stats
 * Instructor-only access required
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useReactTable, getCoreRowModel, flexRender, ColumnDef } from "@tanstack/react-table";
import { AuthGuard } from "@/components/auth/auth-guard";
import { usePaginatedBanks, useDeleteBank } from "@/query/use-banks";
import { Bank } from "@/services/banks";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, BookOpen, Plus, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";

interface PaginationState {
    pageIndex: number;
    pageSize: number;
}

function BanksListContent() {
    const router = useRouter();
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const { data, isLoading, error } = usePaginatedBanks(pagination);
    const deleteBank = useDeleteBank();

    const columns: ColumnDef<Bank>[] = [
        {
            accessorKey: "name",
            header: "Bank Name",
            cell: ({ row }) => (
                <button
                    onClick={() => router.push(`/instructor/banks/${row.original.id}`)}
                    className="font-medium text-blue-600 hover:underline"
                >
                    {row.getValue("name")}
                </button>
            ),
        },
        {
            accessorKey: "description",
            header: "Description",
            cell: ({ row }) => {
                const desc = row.getValue("description") as string | undefined;
                return desc ? (
                    <p className="text-gray-600 truncate max-w-xs">{desc}</p>
                ) : (
                    <p className="text-gray-400 italic">No description</p>
                );
            },
        },
        {
            accessorKey: "question_count",
            header: "Questions",
            cell: ({ row }) => (
                <Badge variant="outline">{row.getValue("question_count") || 0}</Badge>
            ),
        },
        {
            accessorKey: "shared_with",
            header: "Shared With",
            cell: ({ row }) => (
                <span className="text-sm">{row.getValue("shared_with") || 0} users</span>
            ),
        },
        {
            accessorKey: "created_at",
            header: "Created",
            cell: ({ row }) => {
                const date = row.getValue("created_at") as string;
                return date ? format(new Date(date), "MMM dd, yyyy") : "—";
            },
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/instructor/banks/${row.original.id}/edit`)}
                    >
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                            if (
                                confirm(`Are you sure you want to delete "${row.original.name}"?`)
                            ) {
                                deleteBank.mutate(row.original.id);
                            }
                        }}
                        disabled={deleteBank.isPending}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            ),
        },
    ];

    // eslint-disable-next-line react-hooks/incompatible-library
    const table = useReactTable({
        data: data?.data || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-1/3" />
                <Card className="p-6">
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="h-12 w-full" />
                        ))}
                    </div>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    Failed to load question banks. Please try again.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <BookOpen className="w-8 h-8 text-blue-600" />
                    <div>
                        <h1 className="text-3xl font-bold">Question Banks</h1>
                        <p className="text-gray-600">
                            Manage your question banks and organize questions by topic
                        </p>
                    </div>
                </div>
                <Button onClick={() => router.push("/instructor/banks/create")} className="gap-2">
                    <Plus className="w-4 h-4" />
                    New Bank
                </Button>
            </div>

            {table.getRowModel().rows.length === 0 ? (
                <Card className="p-12">
                    <div className="text-center">
                        <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <h2 className="text-xl font-semibold mb-2">No question banks yet</h2>
                        <p className="text-gray-600 mb-6">
                            Create your first question bank to start organizing questions
                        </p>
                        <Button
                            onClick={() => router.push("/instructor/banks/create")}
                            className="gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Create First Bank
                        </Button>
                    </div>
                </Card>
            ) : (
                <>
                    <Card className="overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <tr key={headerGroup.id}>
                                            {headerGroup.headers.map((header) => (
                                                <th
                                                    key={header.id}
                                                    className="px-6 py-3 text-left text-sm font-semibold text-gray-700"
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
                                    {table.getRowModel().rows.map((row) => (
                                        <tr
                                            key={row.id}
                                            className="border-b hover:bg-gray-50 transition"
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <td key={cell.id} className="px-6 py-4 text-sm">
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext(),
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {/* Pagination */}
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            Showing {pagination.pageIndex * pagination.pageSize + 1} to{" "}
                            {Math.min(
                                (pagination.pageIndex + 1) * pagination.pageSize,
                                data?.total || 0,
                            )}{" "}
                            of {data?.total || 0} banks
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setPagination((prev) => ({
                                        ...prev,
                                        pageIndex: Math.max(0, prev.pageIndex - 1),
                                    }))
                                }
                                disabled={pagination.pageIndex === 0}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <span className="px-4 py-2 text-sm">
                                Page {pagination.pageIndex + 1}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setPagination((prev) => ({
                                        ...prev,
                                        pageIndex: prev.pageIndex + 1,
                                    }))
                                }
                                disabled={
                                    (data?.total || 0) <=
                                    (pagination.pageIndex + 1) * pagination.pageSize
                                }
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default function BanksListPage() {
    return (
        <AuthGuard requiredRoles={["instructor", "admin"]} redirectTo="/dashboard">
            <BanksListContent />
        </AuthGuard>
    );
}
