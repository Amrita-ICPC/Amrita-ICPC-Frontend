"use client";

import { motion } from "framer-motion";
import { FileCode2, Zap, BarChart3, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
    icon: React.ElementType;
    label: string;
    value: number;
    color?: "primary" | "emerald" | "amber" | "red" | "blue";
}

function StatCard({ icon: Icon, label, value, color = "primary" }: StatCardProps) {
    const colorMap = {
        primary: "bg-primary/10 text-primary border-primary/20",
        emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        amber: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        red: "bg-red-500/10 text-red-500 border-red-500/20",
        blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    };

    const glowMap = {
        primary: "hover:shadow-primary/5",
        emerald: "hover:shadow-emerald-500/5",
        amber: "hover:shadow-amber-500/5",
        red: "hover:shadow-red-500/5",
        blue: "hover:shadow-blue-500/5",
    };

    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 },
            }}
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
            <Card
                className={`group relative overflow-hidden border-border/60 bg-gradient-to-br from-card to-muted/30 transition-all duration-300 hover:border-border/80 hover:shadow-2xl ${glowMap[color]}`}
            >
                <div
                    className={`absolute -right-6 -top-6 h-24 w-24 rounded-full blur-3xl opacity-20 ${colorMap[color].split(" ")[0]}`}
                />
                <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                        <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${colorMap[color]} shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                        >
                            <Icon className="h-6 w-6" />
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/60">
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

interface ContestQuestionsStatsProps {
    total: number;
    easy: number;
    medium: number;
    hard: number;
}

export function ContestQuestionsStats({ total, easy, medium, hard }: ContestQuestionsStatsProps) {
    return (
        <motion.div
            variants={{
                show: {
                    transition: {
                        staggerChildren: 0.1,
                    },
                },
            }}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 gap-4 md:grid-cols-4"
        >
            <StatCard icon={FileCode2} label="Total Questions" value={total} color="blue" />
            <StatCard icon={Zap} label="Easy Problems" value={easy} color="emerald" />
            <StatCard icon={BarChart3} label="Medium Problems" value={medium} color="amber" />
            <StatCard icon={AlertCircle} label="Hard Problems" value={hard} color="red" />
        </motion.div>
    );
}
