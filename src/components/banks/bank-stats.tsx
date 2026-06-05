"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Database, CheckCircle, Lock, FileQuestion } from "lucide-react";

export function BankStats() {
    // These stats are currently mocked to match the provided design.
    // They will need to be updated to use actual API data once available.
    const stats = [
        {
            title: "Total Banks",
            value: "2",
            description: "All question banks",
            icon: Database,
            colorClass: "text-blue-500",
            bgClass: "bg-blue-500/10",
            solidBgClass: "bg-blue-500",
        },
        {
            title: "Public",
            value: "1",
            description: "Visible to all users",
            icon: CheckCircle,
            colorClass: "text-green-500",
            bgClass: "bg-green-500/10",
            solidBgClass: "bg-green-500",
        },
        {
            title: "Private",
            value: "1",
            description: "Restricted access",
            icon: Lock,
            colorClass: "text-orange-500",
            bgClass: "bg-orange-500/10",
            solidBgClass: "bg-orange-500",
        },
        {
            title: "Total Questions",
            value: "2",
            description: "Across all banks",
            icon: FileQuestion,
            colorClass: "text-purple-500",
            bgClass: "bg-purple-500/10",
            solidBgClass: "bg-purple-500",
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <Card
                        key={index}
                        className="border-border/60 shadow-sm relative overflow-hidden rounded-xl p-0 gap-0"
                    >
                        <div
                            className={`absolute bottom-0 left-0 right-0 h-1 ${stat.solidBgClass} opacity-80`}
                        ></div>
                        <CardContent className="p-5 flex items-start gap-4">
                            <div
                                className={`flex shrink-0 items-center justify-center rounded-xl size-12 ${stat.bgClass} ${stat.colorClass}`}
                            >
                                <Icon className="size-6" />
                            </div>
                            <div className="flex flex-col">
                                <div className="text-2xl font-bold tracking-tight leading-none">
                                    {stat.value}
                                </div>
                                <div className="text-sm font-semibold mt-1.5">{stat.title}</div>
                                <div className="text-xs text-muted-foreground mt-0.5">
                                    {stat.description}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
