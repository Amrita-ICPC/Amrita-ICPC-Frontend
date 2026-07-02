"use client";

import { AsyncStateHandler } from "@/components/shared/async-state-handler";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetBankDetail } from "@/query/bank-query";

import { BankHero } from "./bank-hero";
import { BankQuestionsHero } from "./bank-questions-hero";
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

                    <BankQuestionsHero
                        bankId={bankId}
                        bankName={bank.name}
                        stats={{
                            total: bank.total_questions_count ?? 0,
                            easy: bank.easy_questions_count ?? 0,
                            medium: bank.medium_questions_count ?? 0,
                            hard: bank.hard_questions_count ?? 0,
                        }}
                    />

                    <BankQuestionsTable bankId={bankId} />
                </div>
            )}
        </AsyncStateHandler>
    );
}
