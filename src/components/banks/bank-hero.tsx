"use client";

import { motion } from "framer-motion";

import {
    Plus,
    Copy,
    Share2,
    Calendar,
    FileCode2,
    BarChart3,
    Trophy,
    Settings,
    MoreVertical,
    Database,
    Trash2,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { StatCard } from "@/components/shared/stat-card";
import { BankShareDialog } from "./bank-share-dialog";
import { BankUpdateDialog } from "./bank-update-dialog";
import { BankCloneDialog } from "./bank-clone-dialog";
import type { BankDetailResponse } from "@/api/generated/model";
import { useSoftDeleteBank, allBanksKey, bankDetailKey } from "@/query/bank-query";

interface BankHeroProps {
    bank: BankDetailResponse;
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
        <div className="space-y-6">
            {/* Header Banner */}
            <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-primary/5 p-8 shadow-sm">
                {/* Decorative Background Elements */}
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-violet-500/5 blur-3xl" />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-4 max-w-3xl">
                        <div className="flex items-center gap-3">
                            <Badge
                                variant="outline"
                                className="bg-primary/5 text-primary border-primary/20 px-2.5 py-0.5 font-semibold tracking-wide"
                            >
                                Question Bank
                            </Badge>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                                <Calendar className="h-3.5 w-3.5" />
                                Created {formattedDate}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                                {bank.name}
                            </h1>
                            {bank.description && (
                                <p className="text-base text-muted-foreground leading-relaxed">
                                    {bank.description}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 pt-2">
                            <BankUpdateDialog
                                bank={bank as any}
                                trigger={
                                    <Button
                                        variant="outline"
                                        className="h-10 bg-background/50 backdrop-blur-sm border-border/60"
                                    >
                                        <Settings className="mr-2 h-4 w-4" />
                                        Edit Bank
                                    </Button>
                                }
                            />

                            <BankShareDialog bankId={bank.id} bankName={bank.name} />

                            <BankCloneDialog targetId={bank.id}>
                                <Button className="h-10 px-4 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                                    <Copy className="mr-2 h-4 w-4" />
                                    Clone Bank
                                </Button>
                            </BankCloneDialog>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-10 w-10 border border-border/40"
                                    >
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem
                                        onClick={() => setIsDeleteDialogOpen(true)}
                                        className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete Bank
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <AlertDialog
                                open={isDeleteDialogOpen}
                                onOpenChange={setIsDeleteDialogOpen}
                            >
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            Are you absolutely sure?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will move the bank to the trash. You can recover it
                                            later if needed, but it will no longer be visible in
                                            your active collections.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel disabled={isDeleting}>
                                            Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={(e) => {
                                                e.preventDefault();
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
                    </div>

                    <div className="hidden lg:block">
                        <div className="relative group">
                            <motion.div
                                animate={{
                                    rotate: [0, 5, 0, -5, 0],
                                    y: [0, -5, 0],
                                }}
                                transition={{
                                    duration: 6,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                                className="flex h-32 w-32 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/20 via-primary/5 to-violet-500/20 border border-primary/20 shadow-2xl backdrop-blur-sm"
                            >
                                <div className="relative">
                                    <Database className="h-16 w-16 text-primary/60 group-hover:text-primary transition-colors duration-500" />
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.5 }}
                                        className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/40"
                                    >
                                        <FileCode2 className="h-4 w-4" />
                                    </motion.div>
                                </div>
                            </motion.div>

                            {/* Decorative Floating Elements */}
                            <motion.div
                                animate={{ y: [0, -10, 0], opacity: [0.3, 0.6, 0.3] }}
                                transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                                className="absolute -left-4 top-0 text-primary/30 font-mono text-xl font-bold"
                            >
                                &#123; &#125;
                            </motion.div>
                            <motion.div
                                animate={{ y: [0, 10, 0], opacity: [0.2, 0.5, 0.2] }}
                                transition={{ duration: 5, repeat: Infinity, delay: 2 }}
                                className="absolute -right-2 bottom-2 text-violet-500/30 font-mono text-lg font-bold"
                            >
                                &lt;/&gt;
                            </motion.div>
                            <motion.div
                                animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-40 w-40 rounded-full border border-primary/10 -z-10"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={FileCode2}
                    label="Easy Questions"
                    value={bank.easy_questions_count ?? 0}
                    color="emerald"
                />
                <StatCard
                    icon={BarChart3}
                    label="Medium Questions"
                    value={bank.medium_questions_count ?? 0}
                    color="amber"
                />
                <StatCard
                    icon={Trophy}
                    label="Hard Questions"
                    value={bank.hard_questions_count ?? 0}
                    color="red"
                />
                <StatCard
                    icon={Share2}
                    label="Active Shares"
                    value={bank.shared_users_count ?? 0}
                    color="blue"
                />
            </div>
        </div>
    );
}
