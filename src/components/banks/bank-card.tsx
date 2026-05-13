"use client";

import { Edit, MoreVertical, Share2, Trash2, BookOpen, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { BankResponse } from "@/api/generated/model/bankResponse";
import { useDeleteBank, allBanksKey, bankDetailKey } from "@/query/bank-query";
import { BankUpdateDialog } from "./bank-update-dialog";
import { BankShareDialog } from "./bank-share-dialog";
import { useQueryClient } from "@tanstack/react-query";

interface BankCardProps {
    bank: BankResponse;
}

export function BankCard({ bank }: BankCardProps) {
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
            onError: (error: any) => {
                toast.error(error?.response?.data?.message || "Failed to delete bank");
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

    const handleCardClick = () => {
        router.push(`/banks/${bank.id}`);
    };

    return (
        <Card
            onClick={handleCardClick}
            className="group cursor-pointer border-border/60 py-0 transition-all hover:border-primary/40 hover:shadow-md"
        >
            <CardContent className="flex h-44 flex-col p-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <BookOpen className="size-5" />
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
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
                                    className="cursor-pointer gap-2"
                                >
                                    <Edit className="size-4" /> Edit Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setShareOpen(true)}
                                    className="cursor-pointer gap-2"
                                >
                                    <Share2 className="size-4" /> Manage Access
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => setDeleteOpen(true)}
                                    className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                                    disabled={isDeleting}
                                >
                                    <Trash2 className="size-4" /> Delete Bank
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <div className="mt-3 min-h-0 flex-1">
                    <p className="line-clamp-1 font-semibold leading-tight transition-colors group-hover:text-primary">
                        {bank.name}
                    </p>
                    <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                        {bank.description || "No description added."}
                    </p>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="size-3.5" />
                    Updated {formattedDate}
                </div>

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
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete {bank.name}?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to delete this bank? This action cannot be
                                    undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={(event) => {
                                        event.preventDefault();
                                        handleDelete();
                                    }}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? "Deleting..." : "Delete Bank"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardContent>
        </Card>
    );
}
