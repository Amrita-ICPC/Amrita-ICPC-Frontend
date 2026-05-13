"use client";

import { Edit, Share2, Trash2, BookOpen, MoreVertical } from "lucide-react";
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
import { useRouter } from "next/navigation";
import { TableCell, TableRow } from "@/components/ui/table";
import { BankResponse } from "@/api/generated/model/bankResponse";
import { useDeleteBank, allBanksKey, bankDetailKey } from "@/query/bank-query";
import { BankUpdateDialog } from "./bank-update-dialog";
import { BankShareDialog } from "./bank-share-dialog";
import { useQueryClient } from "@tanstack/react-query";

interface BankRowItemProps {
    bank: BankResponse;
}

export function BankRowItem({ bank }: BankRowItemProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [updateOpen, setUpdateOpen] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);

    const { mutate: deleteBank, isPending: isDeleting } = useDeleteBank({
        mutation: {
            onSuccess: () => {
                toast.success("Bank deleted successfully");
                queryClient.invalidateQueries({ queryKey: allBanksKey() });
                queryClient.invalidateQueries({ queryKey: bankDetailKey(bank.id) });
            },
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

    const handleRowClick = () => {
        router.push(`/banks/${bank.id}`);
    };

    return (
        <>
            <TableRow
                onClick={handleRowClick}
                className="group cursor-pointer hover:bg-muted/50 transition-colors"
            >
                <TableCell>
                    <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <BookOpen className="size-4" />
                        </div>
                        <div className="min-w-0">
                            <p className="font-medium text-foreground group-hover:text-primary transition-colors leading-tight">
                                {bank.name}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                {bank.description || "No description"}
                            </p>
                        </div>
                    </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{formattedDate}</TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-muted-foreground hover:text-foreground"
                            >
                                <MoreVertical className="size-4" />
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
                </TableCell>
            </TableRow>

            <div onClick={(e) => e.stopPropagation()}>
                <BankUpdateDialog bank={bank} open={updateOpen} onOpenChange={setUpdateOpen} />
                <BankShareDialog
                    bankId={bank.id}
                    bankName={bank.name}
                    open={shareOpen}
                    onOpenChange={setShareOpen}
                />
            </div>
        </>
    );
}
