import { Briefcase, GraduationCap, Users } from "lucide-react";
import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function StatCard({
    title,
    value,
    isLoading,
    icon,
    accentClassName,
    tintClassName,
    iconClassName,
}: {
    title: string;
    value: number;
    isLoading: boolean;
    icon: ReactNode;
    accentClassName: string;
    tintClassName: string;
    iconClassName: string;
}) {
    return (
        <Card className={`relative overflow-hidden ${tintClassName}`}>
            <div className={`absolute inset-x-0 top-0 h-1 ${accentClassName}`} />
            <CardHeader className="flex flex-row items-center justify-between gap-2 p-4 pb-2">
                <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
                <div className={`rounded-md p-2 ${iconClassName}`}>{icon}</div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                {isLoading ? (
                    <Skeleton className="h-7 w-16" />
                ) : (
                    <div className="text-2xl font-semibold">{value}</div>
                )}
            </CardContent>
        </Card>
    );
}

export function AudienceStatsGrid({
    isLoading,
    totalUsers,
    managers,
    instructors,
    students,
}: {
    isLoading: boolean;
    totalUsers: number;
    managers: number;
    instructors: number;
    students: number;
}) {
    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
                title="Total users"
                value={totalUsers}
                isLoading={isLoading}
                icon={<Users className="h-4 w-4" />}
                accentClassName="bg-chart-1"
                tintClassName="bg-chart-1/5"
                iconClassName="bg-chart-1/15 text-chart-1"
            />

            <StatCard
                title="Managers"
                value={managers}
                isLoading={isLoading}
                icon={<Briefcase className="h-4 w-4" />}
                accentClassName="bg-chart-2"
                tintClassName="bg-chart-2/5"
                iconClassName="bg-chart-2/15 text-chart-2"
            />

            <StatCard
                title="Instructors"
                value={instructors}
                isLoading={isLoading}
                icon={<GraduationCap className="h-4 w-4" />}
                accentClassName="bg-chart-3"
                tintClassName="bg-chart-3/5"
                iconClassName="bg-chart-3/15 text-chart-3"
            />

            <StatCard
                title="Students"
                value={students}
                isLoading={isLoading}
                icon={<Users className="h-4 w-4" />}
                accentClassName="bg-chart-4"
                tintClassName="bg-chart-4/5"
                iconClassName="bg-chart-4/15 text-chart-4"
            />
        </div>
    );
}
