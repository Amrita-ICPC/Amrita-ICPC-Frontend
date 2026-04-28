"use client";

import { Users, FileText, Send, Activity, UserCog, BarChart2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import type { ContestDetailResponse } from "@/api/generated/model";

interface ManagementHubProps {
    contest: ContestDetailResponse;
}

export function ManagementHub({ contest }: ManagementHubProps) {
    const cards = [
        {
            title: "Manage Teams",
            description: "View, approve or reject teams and manage team members.",
            metaText: `${contest.team_count ?? 0} Teams`,
            buttonText: "Open Teams",
            icon: Users,
            iconBg: "bg-blue-500/10 dark:bg-blue-500/20",
            iconColor: "text-blue-600 dark:text-blue-400",
            href: `/contest/${contest.id}/teams`,
            metaColor: "text-blue-600 dark:text-blue-400",
        },
        {
            title: "Manage Questions",
            description: "Create, edit, publish and organize contest questions.",
            metaText: `${contest.question_count ?? 0} Questions`,
            buttonText: "Open Questions",
            icon: FileText,
            iconBg: "bg-violet-500/10 dark:bg-violet-500/20",
            iconColor: "text-violet-600 dark:text-violet-400",
            href: `/contest/${contest.id}/questions`,
            metaColor: "text-violet-600 dark:text-violet-400",
        },
        {
            title: "View Submissions",
            description: "View all submissions, run rejudges and check submission status.",
            metaText: `${contest.submission_count ?? 0} Submissions`,
            buttonText: "Open Submissions",
            icon: Send,
            iconBg: "bg-orange-500/10 dark:bg-orange-500/20",
            iconColor: "text-orange-600 dark:text-orange-400",
            href: `/contest/${contest.id}/submissions`,
            metaColor: "text-orange-500",
        },
        {
            title: "Monitor Contest",
            description: "Live monitoring tools, clarifications, leaderboard and system health.",
            metaText: contest.run_status === "LIVE" ? "Contest is live" : "Contest not live yet",
            buttonText: "Open Monitor",
            icon: Activity,
            iconBg: "bg-emerald-500/10 dark:bg-emerald-500/20",
            iconColor: "text-emerald-600 dark:text-emerald-400",
            href: `/contest/${contest.id}/monitor`,
            metaColor: "text-emerald-600 dark:text-emerald-500",
        },
        {
            title: "Manage Staff",
            description: "Add or manage instructors, judges and contest staff.",
            metaText: "Manage Instructors", // Hardcoded or maybe instructors count if we have it
            buttonText: "Open Staff",
            icon: UserCog,
            iconBg: "bg-yellow-500/10 dark:bg-yellow-500/20",
            iconColor: "text-yellow-600 dark:text-yellow-400",
            href: `/contest/${contest.id}/staff`,
            metaColor: "text-yellow-600 dark:text-yellow-500",
        },
        {
            title: "Reports & Analytics",
            description: "View summary reports, exports and performance analytics.",
            metaText: "",
            buttonText: "View Reports",
            icon: BarChart2,
            iconBg: "bg-indigo-500/10 dark:bg-indigo-500/20",
            iconColor: "text-indigo-600 dark:text-indigo-400",
            href: `/contest/${contest.id}/reports`,
            metaColor: "",
        },
    ];

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Management Hub</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {cards.map((card, i) => {
                    const Icon = card.icon;
                    return (
                        <Card
                            key={i}
                            className="flex flex-col border-border/60 bg-card hover:bg-muted/20 transition-colors overflow-hidden"
                        >
                            <div className="flex flex-1 flex-col p-5">
                                <div className="flex items-start gap-4">
                                    <div
                                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${card.iconBg}`}
                                    >
                                        <Icon className={`h-6 w-6 ${card.iconColor}`} />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-semibold text-base text-foreground leading-none mt-1">
                                            {card.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground leading-snug">
                                            {card.description}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-border/40 px-5 py-3 mt-auto bg-muted/10">
                                <span className={`text-xs font-medium ${card.metaColor}`}>
                                    {card.metaText}
                                </span>
                                <Link
                                    href={card.href}
                                    className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <span className="rounded-md border border-border/50 bg-background/50 px-2.5 py-1.5 flex items-center gap-1.5 hover:bg-muted/50 transition-colors shadow-sm">
                                        {card.buttonText}
                                        <ArrowRight className="h-3 w-3" />
                                    </span>
                                </Link>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
