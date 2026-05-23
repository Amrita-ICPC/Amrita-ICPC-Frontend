"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useGetMyTeamInvitationsApiV1UsersMeTeamInvitationGet } from "@/api/generated/users/users";
import { AsyncStateHandler } from "@/components/shared/async-state-handler";
import { StudentInvitationCard } from "./invitation-card";
import { AppPagination } from "@/components/shared/app-pagination";
import { Mail } from "lucide-react";
import { ContestTeamMemberStatus } from "@/api/generated/model";

export default function ContestTeamInvitationClient() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const { data, isLoading, isError, error, refetch } =
        useGetMyTeamInvitationsApiV1UsersMeTeamInvitationGet({
            status: ContestTeamMemberStatus.INVITED,
        });

    const invitations = data?.data || [];
    const pageSize = 6;
    const currentPage = parseInt(searchParams.get("page") || "1", 10);
    const totalPages = Math.ceil(invitations.length / pageSize) || 1;

    const paginatedInvitations = invitations.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize,
    );

    const setPage = (newPage: number) => {
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.set("page", String(newPage));
        router.push(`${pathname}?${newParams.toString()}`);
    };

    return (
        <div className="flex flex-col gap-5">
            {/* Content handler */}
            <AsyncStateHandler
                isLoading={isLoading}
                isError={isError}
                error={error}
                onRetry={refetch}
                errorTitle="Failed to load invitations"
            >
                {invitations.length === 0 ? (
                    <div className="min-h-[350px] flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border/60 bg-card p-8 text-center shadow-sm">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20">
                            <Mail className="h-6 w-6" />
                        </div>
                        <div className="space-y-1.5">
                            <h3 className="font-extrabold text-base text-foreground">
                                No Pending Invitations
                            </h3>
                            <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                                You don&apos;t have any pending team invitations at the moment. When
                                a teammate invites you to join, you will see it listed here.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {paginatedInvitations.map((invitation) => (
                                <StudentInvitationCard
                                    key={invitation.id}
                                    invitation={invitation}
                                />
                            ))}
                        </div>

                        {invitations.length > pageSize && (
                            <div className="mt-4">
                                <AppPagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    hasPrevious={currentPage > 1}
                                    hasNext={currentPage < totalPages}
                                    onPageChange={setPage}
                                />
                            </div>
                        )}
                    </div>
                )}
            </AsyncStateHandler>
        </div>
    );
}
