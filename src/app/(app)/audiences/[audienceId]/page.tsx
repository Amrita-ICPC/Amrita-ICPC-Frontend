import AuthGuard from "@/components/global/auth-guard";
import AccessDenied from "@/components/global/access-denied";
import { UserType } from "@/lib/auth/utils";
import { getSingleValue, parsePage, parsePageSize } from "@/lib/search-params";
import { AudienceDetailsClient } from "@/app/(app)/audiences/[audienceId]/audience-details-client";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function AudienceDetailsPage(props: {
    params: Promise<{ audienceId: string }>;
    searchParams?: Promise<SearchParams>;
}) {
    const { audienceId } = await props.params;
    const resolvedParams = await props.searchParams;

    const initialPage = parsePage(resolvedParams?.page, 1);
    const initialPageSize = parsePageSize(resolvedParams?.page_size, 10);
    const initialRole = getSingleValue(resolvedParams?.role) ?? "all";

    return (
        <AuthGuard requiredGroups={[UserType.ADMIN]} fallbackComponent={<AccessDenied />}>
            <AudienceDetailsClient
                audienceId={audienceId}
                initialPage={initialPage}
                initialPageSize={initialPageSize}
                initialRole={initialRole}
            />
        </AuthGuard>
    );
}
