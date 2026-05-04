"use client";

import { motion } from "framer-motion";
import { memo } from "react";
import { FileCode2, Zap, BarChart3, AlertCircle } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";

interface ContestQuestionsStatsProps {
    total: number;
    easy: number;
    medium: number;
    hard: number;
}

export const ContestQuestionsStats = memo(function ContestQuestionsStats({
    total,
    easy,
    medium,
    hard,
}: ContestQuestionsStatsProps) {
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
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
                <StatCard icon={FileCode2} label="Total Questions" value={total} color="blue" />
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
                <StatCard icon={Zap} label="Easy Problems" value={easy} color="emerald" />
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
                <StatCard icon={BarChart3} label="Medium Problems" value={medium} color="amber" />
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
                <StatCard icon={AlertCircle} label="Hard Problems" value={hard} color="red" />
            </motion.div>
        </motion.div>
    );
});
