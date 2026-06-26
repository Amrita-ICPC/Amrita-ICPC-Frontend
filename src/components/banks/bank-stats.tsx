"use client";

import { Database, FileQuestion, Globe, Lock } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function BankStats() {
    // These stats are currently mocked to match the provided design.
    // They will need to be updated to use actual API data once available.
    const stats = [
        {
            title: "Total Banks",
            value: "2",
            description: "All question banks",
            icon: Database,
            colorClass: "text-maroon",
            bgClass: "bg-maroon/10 border-maroon/20",
            borderBgClass: "bg-maroon",
        },
        {
            title: "Public Banks",
            value: "1",
            description: "Visible to all users",
            icon: Globe,
            colorClass: "text-blue",
            bgClass: "bg-blue/10 border-blue/20",
            borderBgClass: "bg-blue",
        },
        {
            title: "Private Banks",
            value: "1",
            description: "Restricted access",
            icon: Lock,
            colorClass: "text-red",
            bgClass: "bg-red/10 border-red/20",
            borderBgClass: "bg-red",
        },
        {
            title: "Total Questions",
            value: "2",
            description: "Across all collections",
            icon: FileQuestion,
            colorClass: "text-gold",
            bgClass: "bg-gold/10 border-gold/20",
            borderBgClass: "bg-gold",
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <Card
                        key={index}
                        className="border-border/60 bg-card shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 relative overflow-hidden rounded-2xl"
                    >
                        {/* Subtle left-side border indicator using brand colors */}
                        <div
                            className={`absolute left-0 top-0 bottom-0 w-1 ${stat.borderBgClass}`}
                        />
                        <CardContent className="p-5 flex items-center gap-4">
                            <div
                                className={`flex shrink-0 items-center justify-center rounded-xl size-12 border ${stat.bgClass} ${stat.colorClass}`}
                            >
                                <Icon className="size-5" />
                            </div>
                            <div className="flex flex-col">
                                <div className="text-2xl font-bold tracking-tight text-foreground leading-none">
                                    {stat.value}
                                </div>
                                <div className="text-sm font-semibold text-foreground mt-1.5 leading-none">
                                    {stat.title}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1.5">
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
