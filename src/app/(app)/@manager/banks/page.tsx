import { Metadata } from "next";
import { BankList } from "@/components/banks/bank-list";
import { BankCreateDialog } from "@/components/banks/bank-create-dialog";

export const metadata: Metadata = {
    title: "Bank Explorer | Amrita ICPC",
    description: "Manage question banks and shared resources.",
};

export default function BanksPage() {
    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Bank Explorer</h1>
                    <p className="text-white/50 mt-1">
                        Create and manage your question banks for contests.
                    </p>
                </div>
                <BankCreateDialog />
            </div>

            <BankList />
        </div>
    );
}
