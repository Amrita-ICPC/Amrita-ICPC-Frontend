"use client";

import { Plus } from "lucide-react";
import Link from "next/link";

import { AsyncStateHandler } from "@/components/shared/async-state-handler";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetBankDetail } from "@/query/bank-query";

import { BankHero } from "./bank-hero";
import { BankQuestionsTable } from "./bank-questions-table";

interface BankDetailClientProps {
    bankId: string;
}

function BankDetailSkeleton() {
    return (
        <div className="flex flex-col gap-4">
            <Skeleton className="h-36 w-full rounded-lg" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-lg" />
                ))}
            </div>
            <Skeleton className="h-96 w-full rounded-lg" />
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
                <div className="flex animate-in flex-col gap-5 fade-in slide-in-from-bottom-4 duration-500">
                    <BankHero bank={bank} />

                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold tracking-tight text-foreground">
                                    Questions
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Manage the problems in this collection.
                                </p>
                            </div>
                            <Button asChild>
                                <Link href={`/banks/${bankId}/questions/new`}>
                                    <Plus data-icon="inline-start" />
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
