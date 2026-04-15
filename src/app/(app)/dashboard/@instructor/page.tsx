import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Clock, Zap, Trophy } from "lucide-react";
import { auth } from "@/lib/auth/auth";
import { logger } from "@/lib/logger";

export default async function InstructorDashboard() {
    const session = await auth();
    logger.info({ userId: session?.user?.id }, "Instructor dashboard loaded");

    const stats = [
        {
            label: "My Contests",
            value: "3",
            icon: Trophy,
            color: "text-teal-400",
            bgColor: "bg-teal-400/10",
        },
        {
            label: "Question Banks",
            value: "8",
            icon: BookOpen,
            color: "text-green-400",
            bgColor: "bg-green-400/10",
        },
        {
            label: "Active Teams",
            value: "24",
            icon: Users,
            color: "text-blue-400",
            bgColor: "bg-blue-400/10",
        },
        {
            label: "Pending Submissions",
            value: "7",
            icon: Zap,
            color: "text-orange-400",
            bgColor: "bg-orange-400/10",
        },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">Instructor Dashboard</h1>
                <p className="mt-2 text-white/60">Manage contests and monitor progress</p>
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

            {/* Ongoing Contests */}
            <div>
                <h2 className="text-xl font-semibold text-white mb-4">Ongoing Contests</h2>
                <div className="space-y-4">
                    {[
                        {
                            name: "Spring Challenge 2026",
                            startTime: "2026-04-15 10:00",
                            endTime: "2026-04-15 15:00",
                            teams: 18,
                            status: "running",
                        },
                        {
                            name: "Data Structures Deep Dive",
                            startTime: "2026-04-16 14:00",
                            endTime: "2026-04-16 17:00",
                            teams: 12,
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
                                        <div className="flex items-center gap-1">
                                            <Users className="w-4 h-4" />
                                            {contest.teams} teams
                                        </div>
                                    </div>
                                </div>
                                <Badge
                                    className={
                                        contest.status === "running"
                                            ? "bg-green-400/20 text-green-300 border-green-400/30"
                                            : "bg-blue-400/20 text-blue-300 border-blue-400/30"
                                    }
                                >
                                    {contest.status === "running" ? "Running" : "Scheduled"}
                                </Badge>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Card className="border border-white/10 bg-white/5 p-6 hover:bg-white/8 transition cursor-pointer">
                        <h3 className="font-semibold text-white">Create Contest</h3>
                        <p className="mt-2 text-sm text-white/60">
                            Set up a new programming contest
                        </p>
                        <Badge className="mt-4 bg-teal-400/20 text-teal-300 border-teal-400/30">
                            Contest
                        </Badge>
                    </Card>

                    <Card className="border border-white/10 bg-white/5 p-6 hover:bg-white/8 transition cursor-pointer">
                        <h3 className="font-semibold text-white">View Submissions</h3>
                        <p className="mt-2 text-sm text-white/60">
                            Review and grade student submissions
                        </p>
                        <Badge className="mt-4 bg-purple-400/20 text-purple-300 border-purple-400/30">
                            Grading
                        </Badge>
                    </Card>
                </div>
            </div>
        </div>
    );
}
