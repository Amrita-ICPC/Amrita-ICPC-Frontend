"use client";

import { useGetBankDetail } from "@/query/bank-query";
import { AsyncStateHandler } from "@/components/shared/async-state-handler";
import { BankHero } from "./bank-hero";
import { BankQuestionsTable } from "./bank-questions-table";
import { BankCloneDialog } from "./bank-clone-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

interface BankDetailClientProps {
    bankId: string;
}

function BankDetailSkeleton() {
    return (
        <div className="space-y-8">
            <Skeleton className="h-[280px] w-full rounded-2xl" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-24 w-full rounded-xl" />
                ))}
            </div>
            <div className="space-y-4">
                <Skeleton className="h-[400px] w-full rounded-xl" />
            </div>
        </div>
    );
}

export function BankDetailClient({ bankId }: BankDetailClientProps) {
    const { data, isLoading, isError, error, refetch } = useGetBankDetail(bankId);
    const bank = data?.data;

    return (
        <AsyncStateHandler
            isLoading={isLoading}
            isError={isError || (!isLoading && !bank)}
            error={error}
            onRetry={refetch}
            errorTitle="Bank Not Found"
            loadingComponent={<BankDetailSkeleton />}
        >
            {bank && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <BankHero bank={bank} />

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold tracking-tight text-foreground">
                                    Questions
                                </h2>
                                <p className="text-sm text-muted-foreground font-medium">
                                    Manage the problems in this collection.
                                </p>
                            </div>
                            <Button asChild className="gap-2 shadow-lg shadow-primary/20">
                                <Link href={`/banks/${bankId}/questions/new`}>
                                    <Plus className="h-4 w-4" />
                                    Add Question
                                </Link>
                            </Button>
                        </div>
                        <BankQuestionsTable bankId={bankId} />
                    </div>
                </div>
            )}
        </AsyncStateHandler>
    );
}
