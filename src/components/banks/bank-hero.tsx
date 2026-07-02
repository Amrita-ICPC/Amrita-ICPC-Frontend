"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
    BookOpen,
    Calendar,
    Copy,
    Crown,
    FileCode2,
    MoreVertical,
    Settings,
    Share2,
    Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";

import type { BankDetailResponse } from "@/api/generated/model";
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { allBanksKey, bankDetailKey, useSoftDeleteBank } from "@/query/bank-query";

import { BankShareDialog } from "./bank-share-dialog";
import { BankUpdateDialog } from "./bank-update-dialog";

interface BankHeroProps {
    bank: BankDetailResponse;
}

function MetaCell({
    icon: Icon,
    label,
    value,
    iconClass,
}: {
    icon: React.ElementType;
    label: string;
    value: React.ReactNode;
    iconClass?: string;
}) {
    return (
        <div className="rounded-2xl border border-white/10 bg-[#081326]/55 p-4 backdrop-blur-md">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                <Icon className={`size-4 ${iconClass ?? "text-primary"}`} />
                {label}
            </div>
            <p className="text-sm font-semibold text-white">{value}</p>
        </div>
    );
}

export function BankHero({ bank }: BankHeroProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const { mutate: deleteBank, isPending: isDeleting } = useSoftDeleteBank({
        mutation: {
            onSuccess: () => {
                toast.success("Bank deleted successfully");
                queryClient.invalidateQueries({ queryKey: allBanksKey() });
                queryClient.invalidateQueries({ queryKey: bankDetailKey(bank.id) });
                router.push("/banks");
            },
            onError: (error: any) => {
                toast.error(error?.response?.data?.message || "Failed to delete bank");
            },
        },
    });

    const isOwner = !!session?.user?.id && session.user.id === bank.created_by;

    const formattedDate = new Date(bank.created_at).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    return (
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#081326] p-7 text-white shadow-[0_24px_60px_-28px_rgba(2,6,23,0.8)] md:p-8">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(118deg,color-mix(in_srgb,var(--primary)_66%,#17356b),#081326_78%)] opacity-90" />
            <div className="pointer-events-none absolute -left-16 -top-36 size-[28rem] rounded-full bg-primary/45 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-40 right-1/4 size-80 rounded-full bg-primary/25 blur-3xl" />
            <div className="pointer-events-none absolute inset-0 opacity-15 [background-image:radial-gradient(circle_at_center,white_1px,transparent_1.3px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_82%)]" />
            <BookOpen className="pointer-events-none absolute -bottom-16 -right-5 size-56 rotate-[-5deg] text-white/[0.07]" />

            <div className="relative z-10">
                <div className="mb-7 flex flex-wrap items-start justify-between gap-5">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge
                            variant="outline"
                            className="border-transparent bg-white/10 px-2.5 py-1 text-xs font-semibold text-white/90 backdrop-blur-md"
                        >
                            Question Bank
                        </Badge>
                        {isOwner && (
                            <Badge
                                variant="outline"
                                className="gap-1.5 border-white/15 bg-white/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white/90 backdrop-blur-md"
                            >
                                <Crown className="size-3" />
                                Owner
                            </Badge>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <BankUpdateDialog
                            bank={bank as any}
                            trigger={
                                <Button
                                    variant="outline"
                                    className="h-10 border-white/15 bg-white/10 px-4 text-white backdrop-blur-md hover:bg-white/20 hover:text-white"
                                >
                                    <Settings className="mr-1.5 size-3.5" />
                                    Edit
                                </Button>
                            }
                        />
                        {isOwner && (
                            <BankShareDialog
                                bankId={bank.id}
                                bankName={bank.name}
                                trigger={
                                    <Button
                                        variant="outline"
                                        className="h-10 border-white/15 bg-white/10 px-4 text-white backdrop-blur-md hover:bg-white/20 hover:text-white"
                                    >
                                        <Share2 className="mr-1.5 size-3.5" />
                                        Access
                                    </Button>
                                }
                            />
                        )}
                        <Button
                            asChild
                            className="h-10 border-0 px-4 font-semibold shadow-md shadow-black/20"
                            style={{
                                backgroundColor: "var(--contrast-accent)",
                                color: "var(--contrast-foreground)",
                            }}
                        >
                            <Link href={`/banks/${bank.id}/import`}>
                                <Copy className="mr-1.5 size-3.5" />
                                Clone
                            </Link>
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-10 w-10 border-violet-300/30 bg-violet-400/20 text-violet-100 backdrop-blur-md hover:bg-violet-400/30 hover:text-white"
                                >
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem
                                    className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                                    onClick={() => setIsDeleteDialogOpen(true)}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Bank
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <h1 className="mb-2 max-w-4xl text-3xl font-bold tracking-[-0.03em] text-white md:text-4xl">
                    {bank.name}
                </h1>
                {bank.description && (
                    <p className="max-w-3xl text-sm leading-relaxed text-slate-300 md:text-base">
                        {bank.description}
                    </p>
                )}

                <div className="mt-8 grid max-w-4xl gap-3 sm:grid-cols-3">
                    <MetaCell icon={Calendar} label="Created" value={formattedDate} />
                    <MetaCell
                        icon={FileCode2}
                        label="Total Questions"
                        value={bank.total_questions_count ?? 0}
                        iconClass="text-emerald-400"
                    />
                    <MetaCell
                        icon={Share2}
                        label="Active Shares"
                        value={bank.shared_users_count ?? 0}
                        iconClass="text-violet-300"
                    />
                </div>
            </div>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this bank?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will move the bank to the trash. It will no longer appear in your
                            active collections.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(event) => {
                                event.preventDefault();
                                deleteBank({ bankId: bank.id });
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
    );
}
