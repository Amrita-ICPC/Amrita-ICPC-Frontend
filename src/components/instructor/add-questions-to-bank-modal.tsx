"use client";

/**
 * Add Questions to Bank Modal
 * Allows instructors to add existing questions to a question bank
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef, useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
import { api } from "@/lib/api-client";
import { useAddQuestionToBank } from "@/query/use-banks";
import { Question } from "@/services/banks";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Plus, Code2 } from "lucide-react";

interface AddQuestionsToBankModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    bankId: string;
}

interface PaginationState {
    pageIndex: number;
    pageSize: number;
}

/**
 * Fetch all available questions (not yet in this bank)
 */
async function getAvailableQuestions(
    bankId: string,
    page = 1,
    pageSize = 10,
): Promise<{ data: Question[]; total: number }> {
    return api.get(
        `/api/v1/banks/${bankId}/available-questions?page=${page}&page_size=${pageSize}`,
    );
}

export function AddQuestionsToBankModal({
    isOpen,
    onOpenChange,
    bankId,
}: AddQuestionsToBankModalProps) {
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const [searchQuery, setSearchQuery] = useState("");

    const { data: questionsData, isLoading } = useQuery({
        queryKey: [
            "available-questions",
            bankId,
            pagination.pageIndex,
            pagination.pageSize,
            searchQuery,
        ],
        queryFn: () => getAvailableQuestions(bankId, pagination.pageIndex + 1, pagination.pageSize),
        enabled: isOpen,
    });

    const addQuestion = useAddQuestionToBank();

    const columns: ColumnDef<Question>[] = [
        {
            accessorKey: "title",
            header: "Title",
            cell: ({ row }) => (
                <div>
                    <p className="font-medium text-sm">{row.getValue("title")}</p>
                </div>
            ),
        },
        {
            accessorKey: "language",
            header: "Language",
            cell: ({ row }) => {
                const lang = row.getValue("language") as string;
                return lang ? (
                    <div className="flex items-center gap-2">
                        <Code2 className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{lang}</span>
                    </div>
                ) : (
                    <span className="text-gray-400 text-sm">—</span>
                );
            },
        },
        {
            accessorKey: "difficulty",
            header: "Difficulty",
            cell: ({ row }) => {
                const difficulty = row.getValue("difficulty") as string;
                const difficultyColors: Record<string, string> = {
                    easy: "bg-green-100 text-green-700",
                    medium: "bg-yellow-100 text-yellow-700",
                    hard: "bg-red-100 text-red-700",
                };
                return difficulty ? (
                    <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                            difficultyColors[difficulty] || "bg-gray-100 text-gray-700"
                        }`}
                    >
                        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                    </span>
                ) : (
                    <span className="text-gray-400 text-sm">—</span>
                );
            },
        },
        {
            id: "actions",
            header: "Action",
            cell: ({ row }) => (
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => {
                        addQuestion.mutate({
                            bankId,
                            payload: { question_id: row.original.id },
                        });
                    }}
                    disabled={addQuestion.isPending}
                >
                    <Plus className="w-4 h-4" />
                    Add
                </Button>
            ),
        },
    ];

    // eslint-disable-next-line react-hooks/incompatible-library
    const table = useReactTable({
        data: questionsData?.data || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                    <DialogTitle>Add Questions to Bank</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Search */}
                    <div>
                        <Input
                            placeholder="Search questions by title..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setPagination({ pageIndex: 0, pageSize: 10 });
                            }}
                            className="w-full"
                        />
                    </div>

                    {/* Questions Table */}
                    {isLoading ? (
                        <div className="space-y-2">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-12 w-full" />
                            ))}
                        </div>
                    ) : (questionsData?.data.length || 0) === 0 ? (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                No available questions to add. All existing questions are already in
                                this bank.
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <>
                            <div className="border rounded-lg overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b">
                                        {table.getHeaderGroups().map((headerGroup) => (
                                            <tr key={headerGroup.id}>
                                                {headerGroup.headers.map((header) => (
                                                    <th
                                                        key={header.id}
                                                        className="px-4 py-3 text-left text-sm font-semibold text-gray-700"
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
                                                    <td key={cell.id} className="px-4 py-3 text-sm">
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

                            {/* Pagination */}
                            {(questionsData?.total || 0) > pagination.pageSize && (
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-600">
                                        Showing {pagination.pageIndex * pagination.pageSize + 1} to{" "}
                                        {Math.min(
                                            (pagination.pageIndex + 1) * pagination.pageSize,
                                            questionsData?.total || 0,
                                        )}{" "}
                                        of {questionsData?.total || 0} questions
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
                                            Previous
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
                                                (questionsData?.total || 0) <=
                                                (pagination.pageIndex + 1) * pagination.pageSize
                                            }
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
