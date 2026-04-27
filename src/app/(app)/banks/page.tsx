import { BankCreateDialog } from "@/components/banks/bank-create-dialog";
import { BankList } from "@/components/banks/bank-list";

export default function BanksPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Question Banks</h1>
                    <p className="text-sm text-muted-foreground">Organize and share question collections.</p>
                </div>
                <BankCreateDialog />
            </div>
            <BankList />
        </div>
    );
}
