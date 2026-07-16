"use client";

import { motion } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface StatCardProps {
    icon: React.ElementType;
    label: string;
    value: number | string;
    color?: "primary" | "emerald" | "amber" | "red" | "blue";
    themed?: boolean;
    className?: string;
}

export function StatCard({
    icon: Icon,
    label,
    value,
    color = "primary",
    themed = false,
    className,
}: StatCardProps) {
    const colorMap = {
        primary: "bg-primary/10 text-primary border-primary/20",
        emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        red: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
        blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    };

    const glowMap = {
        primary: "hover:shadow-primary/5",
        emerald: "hover:shadow-emerald-500/5",
        amber: "hover:shadow-amber-500/5",
        red: "hover:shadow-red-500/5",
        blue: "hover:shadow-blue-500/5",
    };

    const surfaceMap = {
        primary:
            "border-primary/20 bg-gradient-to-br from-primary/15 via-primary/5 to-card hover:border-primary/35",
        emerald:
            "border-emerald-500/20 bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-card hover:border-emerald-500/35",
        amber: "border-amber-500/20 bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-card hover:border-amber-500/35",
        red: "border-red-500/20 bg-gradient-to-br from-red-500/15 via-red-500/5 to-card hover:border-red-500/35",
        blue: "border-blue-500/20 bg-gradient-to-br from-blue-500/15 via-blue-500/5 to-card hover:border-blue-500/35",
    };

    return (
        <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={className}
        >
            <Card
                className={cn(
                    "group relative overflow-hidden transition-all duration-300 hover:shadow-2xl dark:bg-card dark:bg-none dark:shadow-sm dark:hover:shadow-md",
                    themed
                        ? "border-primary/20 bg-gradient-to-br from-primary/15 via-primary/5 to-card hover:border-primary/35 hover:shadow-primary/10 dark:border-primary/25 dark:hover:border-primary/40"
                        : surfaceMap[color],
                    !themed && glowMap[color],
                )}
            >
                <div
                    className={cn(
                        "absolute -right-6 -top-6 h-24 w-24 rounded-full blur-3xl opacity-20 dark:hidden",
                        themed ? "bg-contrast" : colorMap[color].split(" ")[0],
                    )}
                />
                <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                        <div
                            className={cn(
                                "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3",
                                themed
                                    ? "border-contrast/25 bg-contrast/15 text-contrast"
                                    : colorMap[color],
                            )}
                        >
                            <Icon className="h-6 w-6" />
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/80">
                                {label}
                            </p>
                            <p className="text-3xl font-bold text-foreground tabular-nums tracking-tight">
                                {value}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
