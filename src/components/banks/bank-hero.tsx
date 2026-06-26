"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
    BarChart3,
    Calendar,
    Copy,
    Database,
    FileCode2,
    MoreVertical,
    Settings,
    Share2,
    Trash2,
    Trophy,
} from "lucide-react";
import { useRouter } from "next/navigation";
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
import { Card, CardContent } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { allBanksKey, bankDetailKey, useSoftDeleteBank } from "@/query/bank-query";

import { BankCloneDialog } from "./bank-clone-dialog";
import { BankShareDialog } from "./bank-share-dialog";
import { BankUpdateDialog } from "./bank-update-dialog";

interface BankHeroProps {
    bank: BankDetailResponse;
}

const WaveBackground = () => (
    <div className="absolute inset-0 z-0 opacity-40 dark:opacity-30 pointer-events-none">
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
                className="text-primary"
                opacity="0.08"
            />
            <path
                d="M0,120 C400,200 800,0 1440,120 L1440,200 L0,200 Z"
                fill="currentColor"
                className="text-primary"
                opacity="0.05"
            />
            <path
                d="M0,160 C500,40 900,180 1440,140 L1440,200 L0,200 Z"
                fill="currentColor"
                className="text-primary"
                opacity="0.03"
            />
        </svg>
    </div>
);

function CompactStat({
    icon: Icon,
    label,
    value,
    dotColorClass,
}: {
    icon: React.ElementType;
    label: string;
    value: number;
    dotColorClass: string;
}) {
    return (
        <Card className="border-border/60 shadow-sm relative overflow-hidden rounded-xl p-0 gap-0 hover:border-primary/20 hover:shadow-md transition-all">
            <CardContent className="flex items-center gap-3.5 p-5">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground">
                    <Icon className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold leading-none tabular-nums">{value}</p>
                        <span className={`size-2 shrink-0 rounded-full ${dotColorClass}`} />
                    </div>
                    <p className="mt-1 truncate text-xs font-semibold text-muted-foreground/80">
                        {label}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

export function BankHero({ bank }: BankHeroProps) {
    const router = useRouter();
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

    const formattedDate = new Date(bank.created_at).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    return (
        <div className="flex flex-col gap-4">
            <Card className="border p-0 gap-0 relative overflow-hidden rounded-2xl">
                <div className="absolute top-0 inset-x-0 h-full bg-competition/5 overflow-hidden pointer-events-none border-b border-border">
                    <WaveBackground />
                    <div className="absolute inset-0 bg-[radial-gradient(var(--competition)_1px,transparent_1px)] bg-[size:14px_14px] opacity-20 [mask-image:linear-gradient(to_bottom,white_40%,transparent_90%)]" />
                </div>
                <CardContent className="relative z-10 p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 flex-1">
                            <div className="mb-4 flex flex-wrap items-center gap-2">
                                <Badge
                                    variant="outline"
                                    className="border-transparent bg-primary/10 text-primary px-2.5 py-0.5 rounded-lg"
                                >
                                    Question Bank
                                </Badge>
                                <span className="flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground">
                                    <Calendar className="size-3.5" />
                                    Created {formattedDate}
                                </span>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="hidden size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:flex">
                                    <Database className="size-5" />
                                </div>
                                <div className="min-w-0">
                                    <h1 className="truncate text-[22px] font-bold tracking-tight">
                                        {bank.name}
                                    </h1>
                                    <p className="mt-1.5 max-w-3xl text-[14px] text-muted-foreground leading-relaxed">
                                        {bank.description || "No description added."}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 bg-card/60 backdrop-blur-sm p-1.5 rounded-xl border border-border/40 shadow-sm">
                            <BankUpdateDialog
                                bank={bank as any}
                                trigger={
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 rounded-lg hover:bg-muted"
                                    >
                                        <Settings className="mr-1.5 size-3.5" />
                                        Edit
                                    </Button>
                                }
                            />
                            <BankShareDialog
                                bankId={bank.id}
                                bankName={bank.name}
                                trigger={
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 rounded-lg hover:bg-muted"
                                    >
                                        <Share2 className="mr-1.5 size-3.5" />
                                        Access
                                    </Button>
                                }
                            />
                            <BankCloneDialog targetId={bank.id}>
                                <Button
                                    variant="default"
                                    size="sm"
                                    className="h-8 rounded-lg shadow-sm"
                                >
                                    <Copy className="mr-1.5 size-3.5" />
                                    Clone
                                </Button>
                            </BankCloneDialog>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-8 rounded-lg hover:bg-muted"
                                    >
                                        <MoreVertical className="size-4 text-muted-foreground" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-44 rounded-xl">
                                    <DropdownMenuItem
                                        onClick={() => setIsDeleteDialogOpen(true)}
                                        className="cursor-pointer gap-2 text-destructive focus:text-destructive rounded-lg"
                                    >
                                        <Trash2 className="size-4" />
                                        Delete Bank
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <CompactStat
                    icon={FileCode2}
                    label="Easy questions"
                    value={bank.easy_questions_count ?? 0}
                    dotColorClass="bg-emerald-500"
                />
                <CompactStat
                    icon={BarChart3}
                    label="Medium questions"
                    value={bank.medium_questions_count ?? 0}
                    dotColorClass="bg-amber-500"
                />
                <CompactStat
                    icon={Trophy}
                    label="Hard questions"
                    value={bank.hard_questions_count ?? 0}
                    dotColorClass="bg-rose-500"
                />
                <CompactStat
                    icon={Share2}
                    label="Active shares"
                    value={bank.shared_users_count ?? 0}
                    dotColorClass="bg-blue-500"
                />
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
