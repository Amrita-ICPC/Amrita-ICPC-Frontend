"use client";

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
import { useDeleteBank } from "@/query/bank-query";

import { BankShareDialog } from "./bank-share-dialog";
import { BankUpdateDialog } from "./bank-update-dialog";

interface BankCardProps {
    bank: BankResponse;
}

function formatDate(value?: string | null) {
    if (!value) return "—";
    return new Intl.DateTimeFormat(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(new Date(value));
}

export function BankCard({ bank }: BankCardProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [updateOpen, setUpdateOpen] = useState(false);

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
    const questionCount = bank.total_questions_count ?? 0;
    const isOwner = !!session?.user?.id && session.user.id === bank.created_by;

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => router.push(`/banks/${bank.id}`)}
            onKeyDown={(e) => {
                if (e.key === "Enter") router.push(`/banks/${bank.id}`);
            }}
            className="group relative flex min-h-[320px] cursor-pointer flex-col overflow-hidden rounded-[20px] border border-border bg-white shadow-[0_16px_32px_-18px_rgba(2,6,23,0.38)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/55 hover:shadow-[0_22px_42px_-18px_rgba(2,6,23,0.5)] dark:border-white/10 dark:bg-[#081326] dark:shadow-[0_16px_32px_-18px_rgba(2,6,23,0.85)] dark:hover:shadow-[0_22px_42px_-18px_rgba(2,6,23,0.95)]"
        >
            <div className="relative min-h-[162px] overflow-hidden border-b border-primary/20 bg-[linear-gradient(118deg,color-mix(in_srgb,var(--primary)_62%,#17356b),#081326_82%)] px-7 py-6">
                <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_center,white_1px,transparent_1.3px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
                <div className="pointer-events-none absolute -left-10 -top-24 size-72 rounded-full bg-primary/35 blur-3xl" />

                <BookOpen
                    aria-hidden="true"
                    strokeWidth={1.65}
                    className="pointer-events-none absolute -bottom-4 -right-2 size-32 rotate-[-4deg] text-white/[0.13] drop-shadow-[0_0_18px_rgba(255,255,255,0.04)] transition-all duration-500 group-hover:-translate-x-1 group-hover:rotate-[-2deg] group-hover:text-white/[0.16]"
                />

                <div className="relative flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white shadow-md backdrop-blur-md">
                            <BookOpen className="size-5" />
                        </div>
                        <div className="min-w-0 pr-8">
                            <div className="flex items-center gap-2">
                                <h3 className="min-w-0 truncate text-[20px] font-bold leading-tight tracking-[-0.02em] text-white">
                                    {bank.name}
                                </h3>
                                {isOwner && (
                                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white/90 backdrop-blur-sm">
                                        <Crown className="size-2.5" />
                                        Owner
                                    </span>
                                )}
                            </div>
                            <p className="mt-1.5 text-sm font-medium text-slate-300">
                                Updated {formatDate(bank.updated_at ?? bank.created_at)}
                            </p>
                        </div>
                    </div>
                    <div onClick={(e) => e.stopPropagation()} className="-mr-1 -mt-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                            onClick={() => setDeleteOpen(true)}
                            disabled={isDeleting}
                            aria-label="Delete bank"
                        >
                            <Trash2 className="size-4" />
                        </Button>
                    </div>
                </div>

                {bank.description && (
                    <p className="relative mt-4 line-clamp-2 text-[13px] leading-relaxed text-slate-300/80">
                        {bank.description}
                    </p>
                )}
            </div>

            <div className="flex min-h-[60px] items-center border-b border-border px-7 text-slate-500 dark:border-white/10 dark:text-slate-300">
                <div className="flex min-w-0 flex-1 items-center gap-2.5 pr-3">
                    <HelpCircle className="size-[18px] shrink-0" />
                    <strong className="text-sm text-slate-900 dark:text-white">
                        {questionCount}
                    </strong>
                    <span className="text-xs">Question{questionCount === 1 ? "" : "s"}</span>
                </div>
                <div className="h-5 w-px bg-border dark:bg-white/10" />
                <div className="flex min-w-0 flex-1 items-center justify-end gap-2.5 pl-3">
                    <CalendarDays className="size-[18px] shrink-0" />
                    <span className="text-xs">Created</span>
                    <strong className="truncate text-sm text-slate-900 dark:text-white">
                        {formatDate(bank.created_at)}
                    </strong>
                </div>
            </div>

            <div className="flex flex-1 items-center gap-2 px-7 py-5">
                {isOwner && (
                    <BankShareDialog
                        bankId={bank.id}
                        bankName={bank.name}
                        trigger={
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 flex-1 rounded-lg border-border/60 shadow-sm transition-all hover:bg-muted"
                                onClick={(e) => {
                                    e.stopPropagation();
                                }}
                            >
                                <Users className="mr-2 size-3.5" />
                                Manage Access
                            </Button>
                        }
                    />
                )}
                <Button
                    variant="default"
                    size="sm"
                    className="h-9 flex-1 rounded-lg shadow-sm transition-transform hover:scale-[1.02]"
                    onClick={(e) => {
                        e.stopPropagation();
                        setUpdateOpen(true);
                    }}
                >
                    <Edit className="mr-2 size-3.5" />
                    Edit Details
                </Button>
            </div>

            <div onClick={(e) => e.stopPropagation()}>
                <BankUpdateDialog bank={bank} open={updateOpen} onOpenChange={setUpdateOpen} />
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
        </div>
    );
}
