import { BankDetailsClient } from "@/app/(app)/@manager/banks/[bankId]/bank-details-client";
import AccessDenied from "@/components/global/access-denied";
import AuthGuard from "@/components/global/auth-guard";
import { UserType } from "@/lib/auth/utils";

export default async function BankDetailsPage() {
    return (
        <AuthGuard requiredGroups={[UserType.MANAGER, UserType.ADMIN]} fallbackComponent={<AccessDenied />}>
            <BankDetailsClient />
        </AuthGuard>
    );
}
