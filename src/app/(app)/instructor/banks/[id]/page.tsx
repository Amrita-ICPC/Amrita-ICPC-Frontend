"use client";

/**
 * Bank Detail Page
 * Displays bank information and questions table with management actions
 * Instructor-only access required
 */

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useReactTable, getCoreRowModel, flexRender, ColumnDef } from "@tanstack/react-table";
import { AuthGuard } from "@/components/auth/auth-guard";
import {
    useBank,
    useBankQuestions,
    useDeleteBank,
    useRemoveQuestionFromBank,
} from "@/query/use-banks";
import { ShareBankModal } from "@/components/instructor/share-bank-modal";
import { AddQuestionsToBankModal } from "@/components/instructor/add-questions-to-bank-modal";
import { BankQuestion } from "@/services/banks";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, BookOpen, Edit, Trash2, Plus, Code2, Share2 } from "lucide-react";
import { format } from "date-fns";

interface PaginationState {
    pageIndex: number;
    pageSize: number;
}

function BankDetailContent() {
    const router = useRouter();
    const params = useParams();
    const bankId = params?.id as string;
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isAddQuestionsModalOpen, setIsAddQuestionsModalOpen] = useState(false);

    const { data: bank, isLoading: bankLoading, error: bankError } = useBank(bankId);
    const { data: questionsData, isLoading: questionsLoading } = useBankQuestions(
        bankId,
        pagination,
    );
    const deleteBank = useDeleteBank();
    const removeQuestion = useRemoveQuestionFromBank();

    const columns: ColumnDef<BankQuestion>[] = [
        {
            accessorKey: "title",
            header: "Question Title",
            cell: ({ row }) => (
                <button
                    onClick={() =>
                        router.push(`/instructor/banks/${bankId}/questions/${row.original.id}`)
                    }
                    className="font-medium text-blue-600 hover:underline"
                >
                    {row.getValue("title")}
                </button>
            ),
        },
        {
            accessorKey: "difficulty",
            header: "Difficulty",
            cell: ({ row }) => {
                const difficulty = (row.getValue("difficulty") as string) || "—";
                const colors = {
                    easy: "bg-green-100 text-green-800",
                    medium: "bg-yellow-100 text-yellow-800",
                    hard: "bg-red-100 text-red-800",
                };
                return (
                    <Badge className={colors[difficulty as keyof typeof colors] || ""}>
                        {difficulty}
                    </Badge>
                );
            },
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
            accessorKey: "time_limit",
            header: "Time Limit",
            cell: ({ row }) => {
                const limit = row.getValue("time_limit") as number;
                return limit ? <span className="text-sm">{limit}s</span> : <span>—</span>;
            },
        },
        {
            accessorKey: "memory_limit",
            header: "Memory Limit",
            cell: ({ row }) => {
                const limit = row.getValue("memory_limit") as number;
                return limit ? <span className="text-sm">{limit}MB</span> : <span>—</span>;
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
                        onClick={() =>
                            router.push(
                                `/instructor/banks/${bankId}/questions/${row.original.id}/edit`,
                            )
                        }
                    >
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                            if (confirm("Are you sure you want to remove this question?")) {
                                removeQuestion.mutate({
                                    bankId,
                                    questionId: row.original.id,
                                });
                            }
                        }}
                        disabled={removeQuestion.isPending}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            ),
        },
    ];

    // eslint-disable-next-line react-hooks/incompatible-library
    const table = useReactTable({
        data: questionsData?.data || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    if (bankLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-1/3" />
                <Card className="p-6">
                    <div className="space-y-4">
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-6 w-2/3" />
                    </div>
                </Card>
            </div>
        );
    }

    if (bankError || !bank) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Failed to load bank details. Please try again.</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-6">
            {/* Navigation */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Button>
            </div>

            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <BookOpen className="w-8 h-8 text-blue-600" />
                    <div>
                        <h1 className="text-3xl font-bold">{bank.name}</h1>
                        {bank.description && (
                            <p className="text-gray-600 mt-1">{bank.description}</p>
                        )}
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => setIsShareModalOpen(true)}
                    >
                        <Share2 className="w-4 h-4" />
                        Share
                    </Button>
                    <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => router.push(`/instructor/banks/${bankId}/edit`)}
                    >
                        <Edit className="w-4 h-4" />
                        Edit Bank
                    </Button>
                    <Button
                        variant="destructive"
                        className="gap-2"
                        onClick={() => {
                            if (confirm(`Are you sure you want to delete "${bank.name}"?`)) {
                                deleteBank.mutate(bankId);
                            }
                        }}
                        disabled={deleteBank.isPending}
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete
                    </Button>
                </div>
            </div>

            {/* Bank Metadata Card */}
            <Card className="p-6">
                <div className="grid grid-cols-4 gap-4">
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Questions</p>
                        <p className="text-2xl font-bold">{bank.question_count || 0}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Shared With</p>
                        <p className="text-2xl font-bold">{bank.shared_with || 0}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Created</p>
                        <p className="text-sm font-mono">
                            {bank.created_at ? format(new Date(bank.created_at), "MMM dd") : "—"}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Last Updated</p>
                        <p className="text-sm font-mono">
                            {bank.updated_at ? format(new Date(bank.updated_at), "MMM dd") : "—"}
                        </p>
                    </div>
                </div>
            </Card>

            {/* Questions Section */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Questions ({bank.question_count || 0})</h2>
                <Button className="gap-2" onClick={() => setIsAddQuestionsModalOpen(true)}>
                    <Plus className="w-4 h-4" />
                    Add Question
                </Button>
            </div>

            {questionsLoading ? (
                <Card className="p-6">
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="h-12 w-full" />
                        ))}
                    </div>
                </Card>
            ) : table.getRowModel().rows.length === 0 ? (
                <Card className="p-12">
                    <div className="text-center">
                        <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No questions yet</h3>
                        <p className="text-gray-600 mb-6">
                            Add your first question to start building this question bank
                        </p>
                        <Button
                            className="gap-2"
                            onClick={() => router.push(`/instructor/banks/${bankId}/add-question`)}
                        >
                            <Plus className="w-4 h-4" />
                            Add First Question
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

            {/* Share Bank Modal */}
            {bank && (
                <ShareBankModal
                    isOpen={isShareModalOpen}
                    onOpenChange={setIsShareModalOpen}
                    bankId={bankId}
                    bankName={bank.name}
                />
            )}

            {/* Add Questions to Bank Modal */}
            <AddQuestionsToBankModal
                isOpen={isAddQuestionsModalOpen}
                onOpenChange={setIsAddQuestionsModalOpen}
                bankId={bankId}
            />
        </div>
    );
}

export default function BankDetailPage() {
    return (
        <AuthGuard requiredRoles={["instructor", "admin"]} redirectTo="/dashboard">
            <BankDetailContent />
        </AuthGuard>
    );
}
