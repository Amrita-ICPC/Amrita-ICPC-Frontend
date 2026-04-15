import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Clock, BookOpen, Zap } from "lucide-react";
import { auth } from "@/lib/auth/auth";
import { logger } from "@/lib/logger";

export default async function StudentDashboard() {
    const session = await auth();
    logger.info({ userId: session?.user?.id }, "Student dashboard loaded");

    const stats = [
        {
            label: "Contests Participated",
            value: "5",
            icon: Trophy,
            color: "text-amber-400",
            bgColor: "bg-amber-400/10",
        },
        {
            label: "Problems Solved",
            value: "32",
            icon: BookOpen,
            color: "text-green-400",
            bgColor: "bg-green-400/10",
        },
        {
            label: "Current Rank",
            value: "#47",
            icon: Zap,
            color: "text-blue-400",
            bgColor: "bg-blue-400/10",
        },
        {
            label: "Acceptance Rate",
            value: "78%",
            icon: Clock,
            color: "text-purple-400",
            bgColor: "bg-purple-400/10",
        },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">Your Dashboard</h1>
                <p className="mt-2 text-white/60">Track your progress and upcoming contests</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <Card
                            key={idx}
                            className="border border-white/10 bg-white/5 p-6 hover:bg-white/8 transition"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-white/60">{stat.label}</p>
                                    <p className="mt-2 text-2xl font-bold text-white">
                                        {stat.value}
                                    </p>
                                </div>
                                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                                    <Icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Available Contests */}
            <div>
                <h2 className="text-xl font-semibold text-white mb-4">Available Contests</h2>
                <div className="space-y-4">
                    {[
                        {
                            name: "Spring Challenge 2026",
                            startTime: "2026-04-15 10:00",
                            duration: "5 hours",
                            difficulty: "Medium",
                            status: "running",
                        },
                        {
                            name: "Algorithm Series - Graph Theory",
                            startTime: "2026-04-16 14:00",
                            duration: "3 hours",
                            difficulty: "Hard",
                            status: "scheduled",
                        },
                        {
                            name: "DSA Fundamentals",
                            startTime: "2026-04-20 09:00",
                            duration: "4 hours",
                            difficulty: "Easy",
                            status: "scheduled",
                        },
                    ].map((contest) => (
                        <Card
                            key={contest.name}
                            className="border border-white/10 bg-white/5 p-4 hover:bg-white/8 transition cursor-pointer"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-white">{contest.name}</h3>
                                    <div className="mt-2 flex gap-4 text-sm text-white/60">
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            {contest.startTime}
                                        </div>
                                        <div>{contest.duration}</div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <Badge
                                        className={
                                            contest.difficulty === "Easy"
                                                ? "bg-green-400/20 text-green-300 border-green-400/30"
                                                : contest.difficulty === "Medium"
                                                  ? "bg-yellow-400/20 text-yellow-300 border-yellow-400/30"
                                                  : "bg-red-400/20 text-red-300 border-red-400/30"
                                        }
                                    >
                                        {contest.difficulty}
                                    </Badge>
                                    <Badge
                                        className={
                                            contest.status === "running"
                                                ? "bg-green-400/20 text-green-300 border-green-400/30"
                                                : "bg-blue-400/20 text-blue-300 border-blue-400/30"
                                        }
                                    >
                                        {contest.status === "running" ? "Join Now" : "Upcoming"}
                                    </Badge>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Recent Performance */}
            <Card className="border border-white/10 bg-white/5 p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Recent Performance</h2>
                <div className="space-y-4 text-sm">
                    <div className="flex justify-between border-b border-white/10 pb-4">
                        <span className="text-white/70">Spring Challenge 2026</span>
                        <span className="text-green-400">Solved 4/6 problems</span>
                    </div>
                    <div className="flex justify-between border-b border-white/10 pb-4">
                        <span className="text-white/70">Algorithm Series - DP</span>
                        <span className="text-green-400">Solved 5/5 problems</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-white/70">Beginner Practice Round</span>
                        <span className="text-green-400">Solved 10/10 problems</span>
                    </div>
                </div>
            </Card>
        </div>
    );
}
