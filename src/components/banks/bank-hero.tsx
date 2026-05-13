"use client";

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
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

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

function CompactStat({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ElementType;
    label: string;
    value: number;
}) {
    return (
        <Card className="border-border/60 py-0">
            <CardContent className="flex items-center gap-3 p-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                </div>
                <div className="min-w-0">
                    <p className="text-2xl font-bold leading-none tabular-nums">{value}</p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">{label}</p>
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
            <Card className="border-border/60 py-0">
                <CardContent className="p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 flex-1">
                            <div className="mb-3 flex flex-wrap items-center gap-2">
                                <Badge
                                    variant="outline"
                                    className="border-transparent bg-primary/10 text-primary"
                                >
                                    Question Bank
                                </Badge>
                                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Calendar className="size-3.5" />
                                    Created {formattedDate}
                                </span>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="hidden size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:flex">
                                    <Database className="size-5" />
                                </div>
                                <div className="min-w-0">
                                    <h1 className="truncate text-2xl font-bold tracking-tight">
                                        {bank.name}
                                    </h1>
                                    <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
                                        {bank.description || "No description added."}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <BankUpdateDialog
                                bank={bank as any}
                                trigger={
                                    <Button variant="outline" size="sm">
                                        <Settings data-icon="inline-start" />
                                        Edit
                                    </Button>
                                }
                            />
                            <BankShareDialog
                                bankId={bank.id}
                                bankName={bank.name}
                                trigger={
                                    <Button variant="outline" size="sm">
                                        <Share2 data-icon="inline-start" />
                                        Access
                                    </Button>
                                }
                            />
                            <BankCloneDialog targetId={bank.id}>
                                <Button size="sm">
                                    <Copy data-icon="inline-start" />
                                    Clone
                                </Button>
                            </BankCloneDialog>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="size-8">
                                        <MoreVertical className="size-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-44">
                                    <DropdownMenuItem
                                        onClick={() => setIsDeleteDialogOpen(true)}
                                        className="cursor-pointer gap-2 text-destructive focus:text-destructive"
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

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <CompactStat
                    icon={FileCode2}
                    label="Easy questions"
                    value={bank.easy_questions_count ?? 0}
                />
                <CompactStat
                    icon={BarChart3}
                    label="Medium questions"
                    value={bank.medium_questions_count ?? 0}
                />
                <CompactStat
                    icon={Trophy}
                    label="Hard questions"
                    value={bank.hard_questions_count ?? 0}
                />
                <CompactStat
                    icon={Share2}
                    label="Active shares"
                    value={bank.shared_users_count ?? 0}
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
