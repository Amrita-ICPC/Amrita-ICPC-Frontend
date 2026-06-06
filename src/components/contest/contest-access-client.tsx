"use client";

import { ShieldAlert, UserCog, Users } from "lucide-react";
import { useState } from "react";

import AuthGuard from "@/components/global/auth-guard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserType } from "@/lib/auth/utils";
import { useGetContest } from "@/query/contest-query";

import { AsyncStateHandler } from "../shared/async-state-handler";
import { AudiencesSection } from "./audiences-section";
import { InstructorsSection } from "./instructors-section";

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
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary shadow-sm">
                                    <ShieldAlert className="h-6 w-6" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                                        Access Management
                                    </h1>
                                    <p className="text-muted-foreground text-sm">
                                        Manage who can access and participate in{" "}
                                        <span className="font-semibold text-foreground">
                                            {contest?.name}
                                        </span>
                                        .
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="space-y-8 w-full"
                    >
                        <div className="flex justify-start">
                            <TabsList className="bg-muted/40 p-1.5 border border-border/40 shadow-inner rounded-xl">
                                <TabsTrigger
                                    value="instructors"
                                    className="gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
                                >
                                    <UserCog className="h-4 w-4" />
                                    Management Access
                                </TabsTrigger>
                                <TabsTrigger
                                    value="audiences"
                                    className="gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
                                >
                                    <Users className="h-4 w-4" />
                                    Participation Restrictions
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="mt-6">
                            <TabsContent
                                value="instructors"
                                className="m-0 border-none p-0 outline-none animate-in fade-in slide-in-from-bottom-2 duration-300"
                            >
                                <InstructorsSection contestId={contestId} />
                            </TabsContent>

                            <TabsContent
                                value="audiences"
                                className="m-0 border-none p-0 outline-none animate-in fade-in slide-in-from-bottom-2 duration-300"
                            >
                                <AudiencesSection contestId={contestId} />
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </AsyncStateHandler>
        </AuthGuard>
    );
}
