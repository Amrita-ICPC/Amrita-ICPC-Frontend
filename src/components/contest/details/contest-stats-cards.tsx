import { Users2, BookOpen, Send, UserCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
    label: string;
    value: number;
    icon: React.ElementType;
    description: string;
    colorClass: string;
}

function StatCard({ label, value, icon: Icon, description, colorClass }: StatsCardProps) {
    const textColorClass = colorClass.replace("bg-", "text-");
    const lightBgClass = colorClass.replace("bg-", "bg-").concat("/10");

    return (
        <Card className="overflow-hidden border-border/50 shadow-xs hover:shadow-md transition-all duration-300 group bg-card">
            <CardContent className="p-4 sm:p-5">
                <div className="flex items-center gap-3 sm:gap-4">
                    <div
                        className={`flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl ${lightBgClass} ${textColorClass} border border-current/10 transition-transform duration-300 group-hover:scale-105`}
                    >
                        <Icon className="h-5 w-5 sm:h-5.5 sm:w-5.5" />
                    </div>

                    <div className="space-y-0 min-w-0">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">
                            {label}
                        </p>
                        <h3 className="text-lg sm:text-xl font-extrabold tracking-tight text-foreground truncate leading-none mb-1">
                            {value}
                        </h3>
                        <p className="text-[10px] text-muted-foreground font-medium truncate leading-none">
                            {description}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export function ContestStatsCards() {
    const stats = [
        {
            label: "Teams",
            value: 0,
            icon: Users2,
            description: "Registered",
            colorClass: "bg-blue-600",
        },
        {
            label: "Questions",
            value: 0,
            icon: BookOpen,
            description: "Total set",
            colorClass: "bg-indigo-600",
        },
        {
            label: "Submissions",
            value: 0,
            icon: Send,
            description: "Attempts",
            colorClass: "bg-emerald-600",
        },
        {
            label: "Participants",
            value: 0,
            icon: UserCircle2,
            description: "Individual",
            colorClass: "bg-rose-600",
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {stats.map((stat) => (
                <StatCard key={stat.label} {...stat} />
            ))}
        </div>
    );
}
