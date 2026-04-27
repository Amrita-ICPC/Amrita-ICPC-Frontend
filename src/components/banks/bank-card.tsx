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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        month: "short", day: "numeric", year: "numeric",
    });

    return (
        <div className="group relative flex h-[200px] flex-col rounded-xl bg-[#0c1a2e] p-5 shadow-lg shadow-black/30 transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#060f1e]/60 hover:bg-[#0f2040]">
            {/* Hover accent line */}
            <div className="absolute inset-x-0 top-0 h-[2px] rounded-t-xl bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

            {/* Header row */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                    <BookOpen className="h-5 w-5" />
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-600 hover:text-slate-300 hover:bg-white/5"
                        >
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => setUpdateOpen(true)} className="gap-2 cursor-pointer">
                            <Edit className="h-4 w-4" /> Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setShareOpen(true)} className="gap-2 cursor-pointer">
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
                <p className="line-clamp-1 font-bold text-slate-100 group-hover:text-sky-300 transition-colors">
                    {bank.name}
                </p>
                <p className="mt-1.5 line-clamp-2 text-xs text-slate-500 leading-relaxed">
                    {bank.description || "No description provided for this bank."}
                </p>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                <Clock className="h-3 w-3" />
                Updated {formattedDate}
            </div>

            <BankUpdateDialog bank={bank} open={updateOpen} onOpenChange={setUpdateOpen} />
            <BankShareDialog bankId={bank.id} bankName={bank.name} open={shareOpen} onOpenChange={setShareOpen} />
        </div>
    );
}
