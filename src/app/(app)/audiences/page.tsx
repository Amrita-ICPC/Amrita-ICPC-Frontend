import { AudienceClient } from "@/app/(app)/audiences/audience-client";
import AccessDenied from "@/components/global/access-denied";
import AuthGuard from "@/components/global/auth-guard";
import { UserType } from "@/lib/auth/utils";

import { getSingleValue, parsePage, parsePageSize } from "@/lib/search-params";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function AudiencesPage(props: { searchParams?: Promise<SearchParams> }) {
    const resolvedParams = await props.searchParams;
    const initialParams = {
        page: parsePage(resolvedParams?.page, 1),
        page_size: parsePageSize(resolvedParams?.page_size, 10),
        q: getSingleValue(resolvedParams?.q) ?? "",
        audience_type: getSingleValue(resolvedParams?.audience_type) ?? "",
    };

    return (
        <AuthGuard requiredGroups={[UserType.ADMIN]} fallbackComponent={<AccessDenied />}>
            <AudienceClient initialParams={initialParams} />
        </AuthGuard>
    );
}
