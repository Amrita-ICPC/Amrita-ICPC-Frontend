"use client";

import { Edit, Share2, Trash2, BookOpen, Clock, Globe, HelpCircle, Users } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { BankResponse } from "@/api/generated/model/bankResponse";
import { useDeleteBank, allBanksKey, bankDetailKey } from "@/query/bank-query";
import { BankUpdateDialog } from "./bank-update-dialog";
import { BankShareDialog } from "./bank-share-dialog";

interface BankCardProps {
    bank: BankResponse;
}

const WaveBackground = () => (
    <div className="absolute inset-0 z-0 opacity-40 dark:opacity-30">
        <svg
            className="absolute h-full w-full object-cover"
            preserveAspectRatio="none"
            viewBox="0 0 1440 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M0,80 C320,160 560,-40 1440,100 L1440,200 L0,200 Z"
                fill="currentColor"
                className="text-blue-500"
                opacity="0.15"
            />
            <path
                d="M0,120 C400,200 800,0 1440,120 L1440,200 L0,200 Z"
                fill="currentColor"
                className="text-blue-500"
                opacity="0.1"
            />
            <path
                d="M0,160 C500,40 900,180 1440,140 L1440,200 L0,200 Z"
                fill="currentColor"
                className="text-blue-500"
                opacity="0.05"
            />
        </svg>
    </div>
);

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
            className="group cursor-pointer border-border/60 bg-card hover:border-primary/30 transition-all duration-300 hover:shadow-md rounded-[16px] overflow-hidden flex flex-col p-0 gap-0"
            onClick={() => router.push(`/banks/${bank.id}`)}
        >
            {/* Top Section (Blue Background) */}
            <div className="relative flex flex-col p-6 bg-blue-500/5 dark:bg-blue-500/10 border-b border-border/40">
                <WaveBackground />
                <div className="absolute inset-0 bg-[radial-gradient(theme(colors.blue.500)_1px,transparent_1px)] bg-[size:14px_14px] opacity-20 [mask-image:linear-gradient(to_bottom,white_40%,transparent_90%)]" />

                <div className="relative z-10 flex flex-col">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-500 text-white shadow-md shadow-blue-500/20">
                                <BookOpen className="size-4" />
                            </div>
                            <div className="flex flex-col">
                                <h3 className="text-[16px] font-bold leading-tight text-foreground transition-colors group-hover:text-primary line-clamp-1">
                                    {bank.name}
                                </h3>
                                <span className="text-[11px] font-medium text-muted-foreground mt-0.5">
                                    Updated {formattedDate}
                                </span>
                            </div>
                        </div>
                        <div onClick={(e) => e.stopPropagation()} className="-mr-1 -mt-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                onClick={() => setDeleteOpen(true)}
                                disabled={isDeleting}
                            >
                                <Trash2 className="size-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="mt-5 min-h-[40px]">
                        <p className="line-clamp-2 text-[13px] text-muted-foreground leading-relaxed">
                            {bank.description || "No description provided for this question bank."}
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom Section (Stats and Actions) */}
            <div className="flex flex-col p-5 bg-card gap-5">
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Globe className="h-3.5 w-3.5" />
                        <span className="text-[12.5px] font-medium">
                            {(bank as any).is_public ? "Public" : "Private"}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                        <HelpCircle className="h-3.5 w-3.5" />
                        <span className="text-[12.5px] font-medium">
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
                                className="flex-1 h-9 rounded-xl border-border/60 hover:bg-muted shadow-sm transition-all"
                                onClick={(e) => {
                                    e.stopPropagation();
                                }}
                            >
                                <Users className="mr-2 size-3.5" />
                                Manage Access
                            </Button>
                        }
                    />
                    <Button
                        variant="default"
                        size="sm"
                        className="flex-1 h-9 rounded-xl shadow-sm hover:scale-[1.02] transition-transform"
                        onClick={(e) => {
                            e.stopPropagation();
                            setUpdateOpen(true);
                        }}
                    >
                        <Edit className="mr-2 size-3.5" />
                        Edit Details
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
                    <AlertDialogContent className="rounded-[16px] border-border/60">
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
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg"
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
