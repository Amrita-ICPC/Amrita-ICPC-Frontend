"use client";

import { useQueryClient } from "@tanstack/react-query";
import { BookOpen, CalendarDays, Crown, Edit, HelpCircle, Trash2, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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
import { Button } from "@/components/ui/button";
import { allBanksKey, bankDetailKey, useDeleteBank } from "@/query/bank-query";

import { BankShareDialog } from "./bank-share-dialog";
import { BankUpdateDialog } from "./bank-update-dialog";

interface BankRowItemProps {
    bank: BankResponse;
}

export function BankRowItem({ bank }: BankRowItemProps) {
    const router = useRouter();
    const { data: session } = useSession();
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

    const questionCount = bank.total_questions_count ?? 0;
    const isOwner = !!session?.user?.id && session.user.id === bank.created_by;

    const handleRowClick = () => {
        router.push(`/banks/${bank.id}`);
    };

    return (
        <>
            <div
                role="button"
                tabIndex={0}
                onClick={handleRowClick}
                onKeyDown={(e) => {
                    if (e.key === "Enter") handleRowClick();
                }}
                aria-label={`Open bank ${bank.name}`}
                className="group relative flex min-h-[96px] cursor-pointer flex-col gap-3 rounded-[16px] border border-border/60 bg-card p-4 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md md:flex-row md:items-center md:gap-5"
            >
                {/* Left: Icon */}
                <div className="hidden h-[76px] w-[76px] shrink-0 items-center justify-center rounded-[16px] bg-blue-500/10 md:flex">
                    <div className="flex h-[44px] w-[44px] items-center justify-center rounded-full border-[2px] border-blue-500/50 text-blue-500">
                        <BookOpen className="h-5 w-5" />
                    </div>
                </div>

                {/* Middle: Content */}
                <div className="flex flex-1 min-w-0 flex-col justify-center py-1">
                    <div className="flex items-center gap-2">
                        <h3 className="line-clamp-1 min-w-0 text-[17px] font-bold leading-tight text-foreground transition-colors group-hover:text-primary">
                            {bank.name}
                        </h3>
                        {isOwner && (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
                                <Crown className="size-2.5" />
                                Owner
                            </span>
                        )}
                    </div>
                    <div className="mt-1.5 flex items-center gap-1.5 text-[13px] text-muted-foreground truncate">
                        <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">Updated {formattedDate}</span>
                        {bank.description && (
                            <>
                                <span className="shrink-0">·</span>
                                <span className="truncate">{bank.description}</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Right: Stats & Actions */}
                <div className="mt-2 flex shrink-0 items-center justify-between gap-4 pt-3 md:mt-0 md:justify-end md:pt-0">
                    <div className="flex gap-6">
                        <div className="flex flex-col items-start gap-0.5">
                            <div className="flex items-center gap-1 text-muted-foreground">
                                <HelpCircle className="h-3.5 w-3.5 shrink-0" />
                                <span className="text-[12px] font-medium">Questions</span>
                            </div>
                            <span className="text-[16px] font-bold text-foreground pl-[18px]">
                                {questionCount}
                            </span>
                        </div>
                    </div>

                    <div
                        className="flex items-center gap-2 pl-4 border-l border-border/40 ml-1"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {isOwner && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-primary border-primary/20 hover:bg-primary/5 hover:text-primary rounded-lg h-9 px-3.5"
                                onClick={() => setShareOpen(true)}
                            >
                                <Users className="mr-2 size-3.5 shrink-0" /> Manage Access
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-primary border-primary/20 hover:bg-primary/5 hover:text-primary rounded-lg h-9 px-3.5"
                            onClick={() => setUpdateOpen(true)}
                        >
                            <Edit className="mr-2 size-3.5 shrink-0" /> Edit Details
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-9 text-destructive/70 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                            onClick={() => setDeleteOpen(true)}
                            disabled={isDeleting}
                            aria-label="Delete bank"
                        >
                            <Trash2 className="size-4" />
                        </Button>
                    </div>
                </div>
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
