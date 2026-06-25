"use client";

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
import { Card } from "@/components/ui/card";
import { useDeleteBank } from "@/query/bank-query";

import { BankShareDialog } from "./bank-share-dialog";
import { BankUpdateDialog } from "./bank-update-dialog";

interface BankCardProps {
    bank: BankResponse;
}

export function BankCard({ bank }: BankCardProps) {
    const router = useRouter();
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [updateOpen, setUpdateOpen] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);

    const deleteMutation = useDeleteBank({
        mutation: {
            onSuccess: () => {
                toast.success("Bank deleted successfully");
                setDeleteOpen(false);
                router.refresh();
            },
        },
    });

    const isDeleting = deleteMutation.isPending;

    const formattedDate = new Date(bank.updated_at ?? bank.created_at).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });

    return (
        <Card
            className="group cursor-pointer border border-border/40 bg-card hover:border-primary/30 transition-all duration-300 hover:shadow-md rounded-2xl overflow-hidden flex flex-col p-0 gap-0 relative"
            onClick={() => router.push(`/banks/${bank.id}`)}
        >
            {/* Top brand identity gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-maroon via-blue via-red to-gold z-10" />

            {/* Top Section */}
            <div className="relative flex flex-col p-5 pt-6 bg-muted/5 border-b border-border/40">
                <div className="relative flex flex-col">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            {/* Amrita Maroon structural badge */}
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-maroon/10 text-maroon group-hover:bg-maroon group-hover:text-white shadow-sm shadow-maroon/10 transition-all duration-300">
                                <BookOpen className="size-4.5" />
                            </div>
                            <div className="flex flex-col">
                                <h3 className="text-base font-bold leading-tight text-foreground transition-colors group-hover:text-primary line-clamp-1">
                                    {bank.name}
                                </h3>
                                <span className="text-[11px] font-semibold text-muted-foreground mt-1">
                                    Updated {formattedDate}
                                </span>
                            </div>
                        </div>
                        <div onClick={(e) => e.stopPropagation()} className="-mr-1 -mt-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
                                onClick={() => setDeleteOpen(true)}
                                disabled={isDeleting}
                                aria-label="Delete bank"
                            >
                                <Trash2 className="size-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="mt-4 min-h-[36px]">
                        <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                            {bank.description || "No description provided for this question bank."}
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom Section (Stats and Actions) */}
            <div className="flex flex-col p-4 bg-card gap-4">
                <div className="flex items-center justify-between px-1">
                    {/* Visibility badges matching brand colors */}
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

                    {/* Questions count styled in ICPC Blue telemetry */}
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                        <HelpCircle className="h-3.5 w-3.5 text-blue" />
                        <span className="text-xs font-semibold text-foreground/80">
                            {(bank as any).questions_count || (bank as any).questions?.length || 0}{" "}
                            Questions
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <BankShareDialog
                        bankId={bank.id}
                        bankName={bank.name}
                        trigger={
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 h-8 rounded-lg border-border/60 hover:bg-muted text-xs font-semibold cursor-pointer shadow-sm transition-all"
                                onClick={(e) => {
                                    e.stopPropagation();
                                }}
                            >
                                <Users className="mr-1.5 size-3.5" />
                                Share
                            </Button>
                        }
                    />
                    <Button
                        variant="default"
                        size="sm"
                        className="flex-1 h-8 rounded-lg text-xs font-semibold cursor-pointer shadow-sm bg-red hover:bg-red/90 text-white border-transparent hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                        onClick={(e) => {
                            e.stopPropagation();
                            setUpdateOpen(true);
                        }}
                    >
                        <Edit className="mr-1.5 size-3.5" />
                        Edit
                    </Button>
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
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete the bank &quot;{bank.name}&quot; and
                                all its associated questions. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => {
                                    deleteMutation.mutate({ bankId: bank.id });
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
        </Card>
    );
}
