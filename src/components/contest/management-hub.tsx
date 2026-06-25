"use client";

import { ArrowRight, Cpu, FileText, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";

import type { ContestDetailResponse } from "@/api/generated/model";
import { Card } from "@/components/ui/card";

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
            iconBg: "bg-muted/80",
            iconColor: "text-muted-foreground",
            href: `/contest/${contest.id}/teams`,
            metaColor: "text-muted-foreground",
        },
        {
            title: "Manage Questions",
            description: "Create, edit, publish and organize contest questions.",
            metaText: `${contest.question_count ?? 0} Questions`,
            buttonText: "Open Questions",
            icon: FileText,
            iconBg: "bg-muted/80",
            iconColor: "text-muted-foreground",
            href: `/contest/${contest.id}/questions`,
            metaColor: "text-muted-foreground",
        },
        {
            title: "Access Management",
            description: "Manage management permissions and configure participation restrictions.",
            metaText: "Permissions & Access",
            buttonText: "Manage Access",
            icon: ShieldCheck,
            iconBg: "bg-muted/80",
            iconColor: "text-muted-foreground",
            href: `/contest/${contest.id}/access`,
            metaColor: "text-muted-foreground",
        },
        {
            title: "Evaluate Contest",
            description:
                "Trigger evaluation of all contest submissions and view real-time grading progress.",
            metaText: "Evaluate submissions",
            buttonText: "Open Evaluate",
            icon: Cpu,
            iconBg: "bg-muted/80",
            iconColor: "text-muted-foreground",
            href: `/contest/${contest.id}/evaluate`,
            metaColor: "text-muted-foreground",
        },
    ];

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Management Hub</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cards.map((card, i) => {
                    const Icon = card.icon;
                    return (
                        <Card
                            key={i}
                            className="group flex flex-col border-border/60 bg-card hover:border-primary/30 hover:bg-muted/5 transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden"
                        >
                            <div className="flex flex-1 flex-col p-5">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted/80 group-hover:bg-primary/10 transition-colors duration-300">
                                        <Icon className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-semibold text-base text-foreground leading-none mt-1 transition-colors group-hover:text-primary">
                                            {card.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground leading-snug">
                                            {card.description}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-border/40 px-5 py-3 mt-auto bg-muted/10">
                                <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                                    {card.metaText}
                                </span>
                                <Link
                                    href={card.href}
                                    className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors"
                                >
                                    <span className="rounded-md border border-border/50 bg-background/50 px-2.5 py-1.5 flex items-center gap-1.5 group-hover:border-primary/30 group-hover:bg-primary/5 group-hover:text-primary transition-all duration-300 shadow-sm">
                                        {card.buttonText}
                                        <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" />
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
