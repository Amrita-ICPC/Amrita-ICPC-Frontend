import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, Trophy, BarChart3 } from "lucide-react";
import { auth } from "@/lib/auth/auth";
import { logger } from "@/lib/logger";

export default async function AdminDashboard() {
    const session = await auth();
    logger.info({ userId: session?.user?.id }, "Admin dashboard loaded");

    const stats = [
        {
            label: "Total Users",
            value: "1,234",
            icon: Users,
            color: "text-blue-400",
            bgColor: "bg-blue-400/10",
        },
        {
            label: "Active Contests",
            value: "12",
            icon: Trophy,
            color: "text-purple-400",
            bgColor: "bg-purple-400/10",
        },
        {
            label: "Question Banks",
            value: "45",
            icon: BookOpen,
            color: "text-green-400",
            bgColor: "bg-green-400/10",
        },
        {
            label: "Total Questions",
            value: "892",
            icon: BarChart3,
            color: "text-orange-400",
            bgColor: "bg-orange-400/10",
        },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                <p className="mt-2 text-white/60">System overview and management</p>
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

            {/* Quick Actions */}
            <div>
                <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Card className="border border-white/10 bg-white/5 p-6 hover:bg-white/8 transition cursor-pointer">
                        <h3 className="font-semibold text-white">Manage Users</h3>
                        <p className="mt-2 text-sm text-white/60">
                            Create, edit, or remove user accounts
                        </p>
                        <Badge className="mt-4 bg-blue-400/20 text-blue-300 border-blue-400/30">
                            Users
                        </Badge>
                    </Card>

                    <Card className="border border-white/10 bg-white/5 p-6 hover:bg-white/8 transition cursor-pointer">
                        <h3 className="font-semibold text-white">System Settings</h3>
                        <p className="mt-2 text-sm text-white/60">
                            Configure platform-wide settings
                        </p>
                        <Badge className="mt-4 bg-purple-400/20 text-purple-300 border-purple-400/30">
                            Settings
                        </Badge>
                    </Card>
                </div>
            </div>

            {/* Recent Activity */}
            <Card className="border border-white/10 bg-white/5 p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
                <div className="space-y-4 text-sm">
                    <div className="flex justify-between border-b border-white/10 pb-4">
                        <span className="text-white/70">
                            New contest created: &ldquo;Spring Challenge 2026&rdquo;
                        </span>
                        <span className="text-white/40">2 hours ago</span>
                    </div>
                    <div className="flex justify-between border-b border-white/10 pb-4">
                        <span className="text-white/70">3 new instructors approved</span>
                        <span className="text-white/40">5 hours ago</span>
                    </div>
                    <div className="flex justify-between border-b border-white/10 pb-4">
                        <span className="text-white/70">
                            Question bank &ldquo;DSA&rdquo; updated
                        </span>
                        <span className="text-white/40">1 day ago</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-white/70">Platform maintenance completed</span>
                        <span className="text-white/40">3 days ago</span>
                    </div>
                </div>
            </Card>
        </div>
    );
}
