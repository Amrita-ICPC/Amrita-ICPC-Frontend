"use client";

import { useQueryClient } from "@tanstack/react-query";
import { BookOpen, Edit, HelpCircle, Trash2, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { BankResponse } from "@/api/generated/model/bankResponse";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { allBanksKey, bankDetailKey, useDeleteBank } from "@/query/bank-query";

import { BankShareDialog } from "./bank-share-dialog";
import { BankUpdateDialog } from "./bank-update-dialog";

interface BankRowItemProps {
    bank: BankResponse;
}

export function BankRowItem({ bank }: BankRowItemProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [updateOpen, setUpdateOpen] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    const { mutate: deleteBank, isPending: isDeleting } = useDeleteBank({
        mutation: {
            onSuccess: () => {
                toast.success("Bank deleted successfully");
                setDeleteOpen(false);
                queryClient.invalidateQueries({ queryKey: allBanksKey() });
                queryClient.invalidateQueries({ queryKey: bankDetailKey(bank.id) });
            },
            onError: (error: unknown) => {
                toast.error(getDeleteErrorMessage(error));
            },
        },
    });

    const handleDelete = () => {
        deleteBank({ bankId: bank.id });
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
                className="group cursor-pointer border-border/40 hover:bg-background/40 transition-colors"
            >
                <TableCell className="py-4 px-5 w-2/5">
                    <div className="flex items-center gap-4">
                        {/* Amrita Maroon structural icon box */}
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-maroon/10 border border-maroon/10 text-maroon shadow-sm group-hover:bg-maroon group-hover:text-white transition-all duration-300">
                            <BookOpen className="size-4.5" />
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold text-base text-foreground group-hover:text-primary transition-colors leading-tight">
                                {bank.name}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-1.5 font-medium">
                                {bank.description || "No description"}
                            </p>
                        </div>
                    </div>
                </TableCell>
                <TableCell className="text-sm font-medium py-4 px-5">
                    {(() => {
                        const isPublic = (bank as any).is_public ?? (bank as any).public;
                        return isPublic ? (
                            <Badge
                                variant="outline"
                                className="border-gold/30 bg-gold/10 text-gold text-[10px] font-bold uppercase tracking-wider px-2 py-0.5"
                            >
                                Public
                            </Badge>
                        ) : (
                            <Badge
                                variant="outline"
                                className="border-red/30 bg-red/10 text-red text-[10px] font-bold uppercase tracking-wider px-2 py-0.5"
                            >
                                Private
                            </Badge>
                        );
                    })()}
                </TableCell>
                <TableCell className="text-sm font-medium py-4 px-5">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                        <HelpCircle className="size-4 text-blue" />
                        <span className="font-semibold text-foreground/80">
                            {(bank as any).total_questions_count ??
                                (bank as any).questions?.length ??
                                0}{" "}
                            Questions
                        </span>
                    </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground font-semibold py-4 px-5">
                    {formattedDate}
                </TableCell>
                <TableCell className="text-right py-4 px-5">
                    <div
                        className="flex items-center justify-end gap-2"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-muted-foreground border-border hover:bg-muted rounded-lg h-8 px-3 text-xs font-semibold cursor-pointer"
                            onClick={() => setShareOpen(true)}
                        >
                            <Users className="mr-1.5 size-3.5 shrink-0" /> Share
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-primary border-primary/20 hover:bg-primary/5 hover:text-primary rounded-lg h-8 px-3 text-xs font-semibold cursor-pointer"
                            onClick={() => setUpdateOpen(true)}
                        >
                            <Edit className="mr-1.5 size-3.5 shrink-0" /> Edit
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors ml-1 cursor-pointer"
                            onClick={() => setDeleteOpen(true)}
                            disabled={isDeleting}
                        >
                            <Trash2 className="size-4" />
                        </Button>
                    </div>
                </TableCell>
            </TableRow>

            <div onClick={(e) => e.stopPropagation()}>
                <BankUpdateDialog bank={bank} open={updateOpen} onOpenChange={setUpdateOpen} />
                <BankShareDialog
                    bankId={bank.id}
                    bankName={bank.name}
                    open={shareOpen}
                    onOpenChange={setShareOpen}
                    trigger={null}
                />
                <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                    <AlertDialogContent className="rounded-2xl border-border/60">
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete {bank.name}?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete this bank? This action cannot be
                                undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isDeleting} className="rounded-lg">
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={(event) => {
                                    event.preventDefault();
                                    handleDelete();
                                }}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg shadow-sm"
                                disabled={isDeleting}
                            >
                                {isDeleting ? "Deleting..." : "Delete Bank"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </>
    );
}

function getDeleteErrorMessage(error: unknown) {
    if (typeof error === "object" && error !== null && "response" in error) {
        const response = (error as { response?: { data?: { message?: unknown } } }).response;
        if (typeof response?.data?.message === "string") {
            return response.data.message;
        }
    }

    if (error instanceof Error) return error.message;

    return "Failed to delete bank";
}
