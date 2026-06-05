import { BankCreateDialog } from "@/components/banks/bank-create-dialog";
import { BankList } from "@/components/banks/bank-list";
import { BankStats } from "@/components/banks/bank-stats";

export default function BanksPage() {
    return (
        <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
            <div className="flex items-center justify-between mt-2">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Question Banks
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Organize, share, and reuse question collections.
                    </p>
                </div>
                <BankCreateDialog />
            </div>

            <BankStats />

            <BankList />
        </div>
    );
}
