"use client";

import { Edit, MoreVertical, Share2, Trash2, BookOpen, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BankResponse } from "@/api/generated/model/bankResponse";
import { useDeleteBankApiV1BanksBankIdDelete } from "@/api/generated/banks/banks";
import { BankUpdateDialog } from "./bank-update-dialog";
import { BankShareDialog } from "./bank-share-dialog";

interface BankCardProps {
    bank: BankResponse;
}

export function BankCard({ bank }: BankCardProps) {
    const [updateOpen, setUpdateOpen] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);

    const { mutate: deleteBank, isPending: isDeleting } = useDeleteBankApiV1BanksBankIdDelete({
        mutation: {
            onSuccess: () => toast.success("Bank deleted successfully"),
            onError: (error: any) => {
                toast.error(error?.response?.data?.message || "Failed to delete bank");
            },
        },
    });

    const handleDelete = () => {
        if (confirm("Are you sure you want to delete this bank? This action cannot be undone.")) {
            deleteBank({ bankId: bank.id });
        }
    };

    const formattedDate = new Date(bank.updated_at).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    return (
        <div className="group relative flex h-50 flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-[0_10px_24px_-18px_rgba(20,45,103,0.45)] transition-all duration-200 hover:-translate-y-1 hover:border-[#c7d3ef] hover:bg-[#f8faff] hover:shadow-[0_18px_30px_-18px_rgba(20,45,103,0.55)] dark:border-white/12 dark:bg-slate-900 dark:hover:border-white/20 dark:hover:bg-slate-900">
            {/* Hover accent line */}
            <div className="absolute inset-x-0 top-0 h-0.5 rounded-t-xl bg-linear-to-r from-[#2f4f9a] to-[#1f3678] opacity-40 transition-opacity duration-200 group-hover:opacity-100" />

            {/* Header row */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#e7edfb] text-[#27438a] transition-colors group-hover:bg-[#dce6fa] dark:bg-blue-500/20 dark:text-blue-300 dark:group-hover:bg-blue-500/30">
                    <BookOpen className="h-5 w-5" />
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-slate-100"
                        >
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                            onClick={() => setUpdateOpen(true)}
                            className="gap-2 cursor-pointer"
                        >
                            <Edit className="h-4 w-4" /> Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => setShareOpen(true)}
                            className="gap-2 cursor-pointer"
                        >
                            <Share2 className="h-4 w-4" /> Manage Access
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={handleDelete}
                            className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                            disabled={isDeleting}
                        >
                            <Trash2 className="h-4 w-4" /> Delete Bank
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Name + description */}
            <div className="mt-3 flex-1 min-h-0">
                <p className="line-clamp-1 font-bold text-slate-900 transition-colors group-hover:text-[#1f3678] dark:text-slate-100 dark:group-hover:text-blue-300">
                    {bank.name}
                </p>
                <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300/90">
                    {bank.description || "No description provided for this bank."}
                </p>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                <Clock className="h-3 w-3" />
                Updated {formattedDate}
            </div>

            <BankUpdateDialog bank={bank} open={updateOpen} onOpenChange={setUpdateOpen} />
            <BankShareDialog
                bankId={bank.id}
                bankName={bank.name}
                open={shareOpen}
                onOpenChange={setShareOpen}
            />
        </div>
    );
}
