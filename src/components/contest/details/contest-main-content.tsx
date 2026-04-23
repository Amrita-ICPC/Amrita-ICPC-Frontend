"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContestStatsCards } from "./contest-stats-cards";
import { ContestGuidelines } from "./contest-guidelines";
import { ContestInstructorManager } from "./contest-instructor-manager";
import { ContestAudienceManager } from "./contest-audience-manager";
import { ContestCreatorInfo } from "./contest-creator-info";
import { ContestQuestionsPage } from "./contest-questions-page";
import { ContestTeamsPage } from "./contest-teams-page";
import { ContestMonitorPage } from "./contest-monitor-page";
import { LayoutDashboard, BookOpen, BarChart, Users, MonitorPlay } from "lucide-react";
import type { ContestDetailResponse } from "@/api/generated/model";

interface ContestMainContentProps {
    contest: ContestDetailResponse;
}

function OverviewTab({ contest }: { contest: ContestDetailResponse }) {
    return (
        <div className="space-y-8 md:space-y-10">
            <ContestStatsCards />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-stretch">
                <ContestInstructorManager contestId={contest.id} />
                <ContestAudienceManager contestId={contest.id} />
                {contest.creator && <ContestCreatorInfo creator={contest.creator} />}
            </div>
            <ContestGuidelines rules={contest.rules} />
        </div>
    );
}

export function ContestMainContent({ contest }: ContestMainContentProps) {
    const [activeTab, setActiveTab] = useState("overview");

    return (
        <Tabs defaultValue="overview" onValueChange={setActiveTab} className="w-full">
            <TabsList className="border-b border-border h-12 w-full justify-start rounded-none bg-transparent p-0">
                <TabsTrigger
                    value="overview"
                    className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-primary/5 text-muted-foreground gap-2 px-4 transition-all font-semibold"
                >
                    <LayoutDashboard className="h-4 w-4" />
                    Overview
                </TabsTrigger>
                <TabsTrigger
                    value="questions"
                    className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-primary/5 text-muted-foreground gap-2 px-4 transition-all font-semibold"
                >
                    <BookOpen className="h-4 w-4" />
                    Questions
                </TabsTrigger>
                <TabsTrigger
                    value="teams"
                    className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-primary/5 text-muted-foreground gap-2 px-4 transition-all font-semibold"
                >
                    <Users className="h-4 w-4" />
                    Teams
                </TabsTrigger>
                <TabsTrigger
                    value="monitor"
                    className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-primary/5 text-muted-foreground gap-2 px-4 transition-all font-semibold"
                >
                    <MonitorPlay className="h-4 w-4" />
                    Monitor
                </TabsTrigger>
                <TabsTrigger
                    value="leaderboard"
                    disabled
                    className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-primary/5 text-muted-foreground gap-2 px-4 transition-all font-semibold"
                >
                    <BarChart className="h-4 w-4" />
                    Leaderboard
                </TabsTrigger>
            </TabsList>

            <div className="py-8 md:py-10">
                {activeTab === "overview" && <OverviewTab contest={contest} />}
                {activeTab === "questions" && <ContestQuestionsPage />}
                {activeTab === "teams" && <ContestTeamsPage />}
                {activeTab === "monitor" && <ContestMonitorPage />}
            </div>
        </Tabs>
    );
}
