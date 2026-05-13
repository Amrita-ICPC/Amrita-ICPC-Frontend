import { BankCreateDialog } from "@/components/banks/bank-create-dialog";
import { BankList } from "@/components/banks/bank-list";

export default function BanksPage() {
    return (
        <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Question Banks</h1>
                    <p className="text-sm text-muted-foreground">
                        Organize, share, and reuse question collections.
                    </p>
                </div>
                <BankCreateDialog />
            </div>
            <BankList />
        </div>
    );
}
