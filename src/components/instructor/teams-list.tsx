"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    flexRender,
    type ColumnDef,
    type SortingState,
    type ColumnFiltersState,
} from "@tanstack/react-table";
import { useTeamsList, useDeleteTeam, useApproveTeam } from "@/query/use-teams";
import { Team } from "@/services/teams";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Plus, Trash2, CheckCircle2, Loader2 } from "lucide-react";

export function TeamsList() {
    const router = useRouter();
    const params = useParams();
    const contestId = params?.id as string;

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [page, setPage] = useState(1);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [perPage, _] = useState(10);
    const [deleteTeamId, setDeleteTeamId] = useState<string | null>(null);
    const [approveTeamId, setApproveTeamId] = useState<string | null>(null);

    const { data, isLoading } = useTeamsList(contestId, page, perPage);
    const { mutate: deleteTeam, isPending: isDeleting } = useDeleteTeam(contestId);
    const { mutate: approveTeam, isPending: isApproving } = useApproveTeam(contestId);

    const teams = data?.items || [];
    const total = data?.total || 0;
    const totalPages = Math.ceil(total / perPage);

    const columns: ColumnDef<Team>[] = [
        {
            accessorKey: "name",
            header: "Team Name",
            cell: ({ row }) => (
                <button
                    onClick={() =>
                        router.push(`/instructor/contests/${contestId}/teams/${row.getValue("id")}`)
                    }
                    className="font-medium text-blue-600 hover:underline"
                >
                    {row.getValue("name")}
                </button>
            ),
        },
        {
            accessorKey: "member_count",
            header: "Members",
            cell: ({ row }) => <span>{row.getValue("member_count") || 0}</span>,
        },
        {
            accessorKey: "approved",
            header: "Status",
            cell: ({ row }) => {
                const approved = row.getValue("approved");
                return (
                    <Badge variant={approved ? "default" : "secondary"}>
                        {approved ? "Approved" : "Pending"}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "created_at",
            header: "Created",
            cell: ({ row }) => {
                const date = new Date(row.getValue("created_at") as string);
                return date.toLocaleDateString();
            },
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={() =>
                                router.push(
                                    `/instructor/contests/${contestId}/teams/${row.getValue("id")}/edit`,
                                )
                            }
                        >
                            Edit
                        </DropdownMenuItem>
                        {!row.original.approved && (
                            <DropdownMenuItem
                                onClick={() => setApproveTeamId(row.getValue("id"))}
                                className="text-green-600"
                            >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Approve
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                            onClick={() => setDeleteTeamId(row.getValue("id"))}
                            className="text-red-600"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    // eslint-disable-next-line react-hooks/incompatible-library
    const table = useReactTable({
        data: teams,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnFilters,
            globalFilter,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
    });

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div>
                        <CardTitle>Teams</CardTitle>
                        <CardDescription>Manage teams for this contest</CardDescription>
                    </div>
                    <Button
                        onClick={() =>
                            router.push(`/instructor/contests/${contestId}/teams/create`)
                        }
                        className="gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Create Team
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Input
                        placeholder="Filter teams..."
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className="max-w-sm"
                    />

                    <div className="rounded-md border overflow-x-auto">
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
                                            colSpan={columns.length}
                                            className="px-6 py-8 text-center"
                                        >
                                            <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                                        </td>
                                    </tr>
                                ) : table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <tr key={row.id} className="border-b hover:bg-gray-50">
                                            {row.getVisibleCells().map((cell) => (
                                                <td key={cell.id} className="px-6 py-3">
                                                    {cell.getValue() === null
                                                        ? "-"
                                                        : flexRender(
                                                              cell.column.columnDef.cell,
                                                              cell.getContext(),
                                                          )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={columns.length}
                                            className="px-6 py-8 text-center text-gray-500"
                                        >
                                            No teams found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            Page {page} of {totalPages} ({total} total teams)
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page === 1}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(Math.min(totalPages, page + 1))}
                                disabled={page === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <AlertDialog open={!!deleteTeamId} onOpenChange={() => setDeleteTeamId(null)}>
                <AlertDialogContent>
                    <AlertDialogTitle>Delete Team</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete this team? This action cannot be undone.
                    </AlertDialogDescription>
                    <div className="flex gap-4">
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (deleteTeamId) {
                                    deleteTeam(deleteTeamId, {
                                        onSuccess: () => setDeleteTeamId(null),
                                    });
                                }
                            }}
                            disabled={isDeleting}
                            className="gap-2 bg-red-600 hover:bg-red-700"
                        >
                            {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
                            Delete
                        </AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={!!approveTeamId} onOpenChange={() => setApproveTeamId(null)}>
                <AlertDialogContent>
                    <AlertDialogTitle>Approve Team</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to approve this team?
                    </AlertDialogDescription>
                    <div className="flex gap-4">
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (approveTeamId) {
                                    approveTeam(approveTeamId, {
                                        onSuccess: () => setApproveTeamId(null),
                                    });
                                }
                            }}
                            disabled={isApproving}
                            className="gap-2"
                        >
                            {isApproving && <Loader2 className="h-4 w-4 animate-spin" />}
                            Approve
                        </AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
