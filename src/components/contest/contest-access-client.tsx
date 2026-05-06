"use client";

import { useState } from "react";
import { useGetContest } from "@/query/contest-query";
import { AsyncStateHandler } from "../shared/async-state-handler";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCog, Users } from "lucide-react";
import { InstructorsSection } from "./instructors-section";
import { AudiencesSection } from "./audiences-section";
import AuthGuard from "@/components/global/auth-guard";
import { UserType } from "@/lib/auth/utils";

interface ContestAccessClientProps {
    contestId: string;
}

export function ContestAccessClient({ contestId }: ContestAccessClientProps) {
    const [activeTab, setActiveTab] = useState("instructors");

    const {
        data: contestData,
        isLoading: isContestLoading,
        isError: isContestError,
        error: contestError,
        refetch: refetchContest,
    } = useGetContest(contestId);

    const contest = contestData?.data;

    return (
        <AuthGuard requiredGroups={[UserType.ADMIN, UserType.MANAGER, UserType.INSTRUCTOR]}>
            <AsyncStateHandler
                isLoading={isContestLoading}
                isError={isContestError}
                error={contestError}
                onRetry={refetchContest}
            >
                <div className="space-y-6">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-bold tracking-tight">Access Management</h1>
                        <p className="text-muted-foreground">
                            Manage who can access and participate in{" "}
                            <span className="font-medium text-foreground">{contest?.name}</span>.
                        </p>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <TabsList className="bg-muted/50 p-1">
                            <TabsTrigger value="instructors" className="gap-2">
                                <UserCog className="h-4 w-4" />
                                Management Access
                            </TabsTrigger>
                            <TabsTrigger value="audiences" className="gap-2">
                                <Users className="h-4 w-4" />
                                Participation Restrictions
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="instructors" className="border-none p-0 outline-none">
                            <InstructorsSection contestId={contestId} />
                        </TabsContent>

                        <TabsContent value="audiences" className="border-none p-0 outline-none">
                            <AudiencesSection contestId={contestId} />
                        </TabsContent>
                    </Tabs>
                </div>
            </AsyncStateHandler>
        </AuthGuard>
    );
}
