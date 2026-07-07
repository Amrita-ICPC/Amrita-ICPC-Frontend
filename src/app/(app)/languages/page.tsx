import AuthGuard from "@/components/global/auth-guard";
import { LanguagesClient } from "@/components/languages/languages-client";
import { UserType } from "@/lib/auth/utils";

export default async function LanguagesPage() {
    return (
        <AuthGuard requiredGroups={[UserType.ADMIN]}>
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Languages</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage the programming languages available on the platform, sourced from
                        Judge0.
                    </p>
                </div>
                <LanguagesClient />
            </div>
        </AuthGuard>
    );
}
