import { BankCreateDialog } from "@/components/banks/bank-create-dialog";
import { BankList } from "@/components/banks/bank-list";
import { BankStats } from "@/components/banks/bank-stats";

export default function BanksPage() {
    return (
        <div className="flex h-full flex-col space-y-6">
            <div className="flex items-center justify-between border-b border-primary/15 pb-6">
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
