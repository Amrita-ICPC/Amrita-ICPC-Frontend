"use client";

import { Edit, MoreVertical, Share2, Trash2, BookOpen, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
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
            onSuccess: () => {
                toast.success("Bank deleted successfully");
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onError: (error: any) => {
                const message = error?.response?.data?.message || "Failed to delete bank";
                toast.error(message);
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
        <Card className="group relative flex h-full flex-col overflow-hidden border-white/10 bg-[#0f1117] transition-all hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5">
            <CardHeader className="p-6 pb-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                        <BookOpen className="h-6 w-6" />
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-white/40 hover:text-white"
                            >
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="w-48 border-white/10 bg-[#161922] text-white"
                        >
                            <DropdownMenuItem
                                onClick={() => setUpdateOpen(true)}
                                className="gap-2 cursor-pointer focus:bg-white/5"
                            >
                                <Edit className="h-4 w-4" /> Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setShareOpen(true)}
                                className="gap-2 cursor-pointer focus:bg-white/5"
                            >
                                <Share2 className="h-4 w-4" /> Manage Access
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/5" />
                            <DropdownMenuItem
                                onClick={handleDelete}
                                className="gap-2 cursor-pointer text-red-400 focus:bg-red-500/10 focus:text-red-400"
                                disabled={isDeleting}
                            >
                                <Trash2 className="h-4 w-4" /> Delete Bank
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="mt-4 space-y-1">
                    <h3 className="line-clamp-1 text-lg font-bold text-white group-hover:text-primary transition-colors">
                        {bank.name}
                    </h3>
                    <p className="line-clamp-2 text-sm text-white/50 leading-relaxed">
                        {bank.description || "No description provided for this bank."}
                    </p>
                </div>
            </CardHeader>

            <CardContent className="flex-1 px-6 py-2">
                <div className="flex flex-wrap gap-2 mt-2">
                    {/* These would ideally come from the API, placeholder for now */}
                    <Badge variant="secondary" className="bg-white/5 text-white/70 border-white/10">
                        12 Questions
                    </Badge>
                    <Badge variant="secondary" className="bg-white/5 text-white/70 border-white/10">
                        Shared
                    </Badge>
                </div>
            </CardContent>

            <CardFooter className="px-6 py-4 border-t border-white/5 flex items-center justify-between text-xs text-white/40">
                <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    Updated {formattedDate}
                </div>
                <Button
                    variant="link"
                    className="h-auto p-0 text-primary hover:text-primary/80 font-semibold"
                    onClick={() => {}}
                >
                    View Questions
                </Button>
            </CardFooter>

            <BankUpdateDialog bank={bank} open={updateOpen} onOpenChange={setUpdateOpen} />
            <BankShareDialog
                bankId={bank.id}
                bankName={bank.name}
                open={shareOpen}
                onOpenChange={setShareOpen}
            />
        </Card>
    );
}
