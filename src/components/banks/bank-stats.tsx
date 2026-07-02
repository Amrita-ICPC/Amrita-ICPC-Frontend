"use client";

import { Database, HelpCircle, TrendingUp } from "lucide-react";

import { StatCard } from "@/components/shared/stat-card";
import { useGetAllBanks } from "@/query/bank-query";

export function BankStats() {
    const { data, isLoading } = useGetAllBanks({
        page: 1,
        page_size: 100,
    });

    const banks = data?.data ?? [];
    const totalBanks = data?.pagination?.total ?? banks.length;
    const totalQuestions = banks.reduce((sum, bank) => sum + (bank.total_questions_count ?? 0), 0);
    const avgQuestions = totalBanks > 0 ? Math.round(totalQuestions / totalBanks) : 0;

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
                icon={Database}
                label="Total Banks"
                value={isLoading ? "—" : totalBanks}
                color="primary"
                themed
            />
            <StatCard
                icon={HelpCircle}
                label="Total Questions"
                value={isLoading ? "—" : totalQuestions}
                color="blue"
            />
            <StatCard
                icon={TrendingUp}
                label="Avg. Questions / Bank"
                value={isLoading ? "—" : avgQuestions}
                color="emerald"
            />
        </div>
    );
}
