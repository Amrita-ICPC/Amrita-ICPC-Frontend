import { format } from "date-fns";
import {
    Globe,
    Edit,
    Upload,
    Trophy,
    UserCheck,
    Users,
    Layers,
    CalendarCheck,
    CalendarDays,
    Timer,
    TimerOff,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ContestDetailResponse } from "@/api/generated/model";

interface ContestOverviewHeroProps {
    contest: ContestDetailResponse;
    onEdit?: () => void;
    onPublish?: () => void;
}

export function ContestOverviewHero({ contest, onPublish }: ContestOverviewHeroProps) {
    const formatDate = (date: string) => {
        try {
            return format(new Date(date), "MMM dd, yyyy hh:mm a");
        } catch {
            return "Invalid Date";
        }
    };

    return (
        <div className="space-y-4 md:space-y-6">
            <Breadcrumb className="px-1 hidden sm:block">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link
                                href="/dashboard"
                                className="text-xs md:text-sm transition-colors hover:text-primary"
                            >
                                Dashboard
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link
                                href="/contest"
                                className="text-xs md:text-sm transition-colors hover:text-primary"
                            >
                                Contests
                            </Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage className="text-xs md:text-sm font-semibold truncate max-w-[150px] sm:max-w-none">
                            {contest.name}
                        </BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <div className="space-y-4 md:space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                    <div className="space-y-1.5 md:space-y-2">
                        <div className="flex flex-wrap items-center gap-2 md:gap-3">
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
                                {contest.name}
                            </h1>
                            <div className="flex gap-1.5 md:gap-2">
                                <Badge
                                    variant="outline"
                                    className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] md:text-xs font-bold px-2 py-0.5 md:px-2.5 shadow-xs"
                                >
                                    {contest.status}
                                </Badge>
                                {contest.is_public && (
                                    <Badge
                                        variant="outline"
                                        className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] md:text-xs font-bold px-2 py-0.5 md:px-2.5 flex items-center gap-1 shadow-xs"
                                    >
                                        <Globe className="h-3 w-3 md:h-3.5 md:w-3.5" />
                                        PUBLIC
                                    </Badge>
                                )}

                                <Badge
                                    variant="outline"
                                    className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] md:text-xs font-bold px-2 py-0.5 md:px-2.5 shadow-xs"
                                >
                                    {contest.mode?.toUpperCase()}
                                </Badge>
                            </div>
                        </div>
                        <p className="text-muted-foreground text-xs sm:text-sm md:text-base max-w-3xl line-clamp-2 leading-relaxed">
                            {contest.description ||
                                "Challenge yourself and your team in this professional programming competition."}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 md:gap-3 shrink-0">
                        <Link href={`/contest/${contest.id}/edit`}>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 md:h-11 px-3 md:px-5 gap-1.5 md:gap-2 text-xs md:text-sm font-semibold border-border shadow-xs hover:bg-muted/50"
                            >
                                <Edit className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                Edit
                            </Button>
                        </Link>
                        <Button
                            size="sm"
                            onClick={onPublish}
                            className="h-9 md:h-11 px-3 md:px-5 gap-1.5 md:gap-2 text-xs md:text-sm font-bold shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90"
                        >
                            <Upload className="h-3.5 w-3.5 md:h-4 md:w-4" />
                            Publish
                        </Button>
                    </div>
                </div>

                {/* Main Card Section */}
                <Card className="overflow-hidden border-border/60 shadow-lg rounded-xl md:rounded-2xl bg-card">
                    <CardContent className="p-0">
                        <div className="flex flex-col lg:flex-row items-center lg:items-start">
                            {/* Left: Contest Image (Fixed Ratio) */}
                            <div className="w-full lg:w-72 xl:w-80 shrink-0 relative bg-muted lg:border-r border-border/40 group overflow-hidden aspect-video">
                                {/*eslint-disable-next-line @next/next/no-img-element*/}
                                <img
                                    src={
                                        contest.image ||
                                        "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800"
                                    }
                                    alt={contest.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            </div>

                            {/* Right: Timeline Grid */}
                            <div className="flex-1 p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 flex flex-col justify-center overflow-hidden self-stretch">
                                <div className="grid grid-cols-1 sm:grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8 lg:gap-10">
                                    {/* Start Time */}
                                    <div className="flex items-start gap-3 md:gap-4 group min-w-0">
                                        <div className="flex h-9 w-9 md:h-11 md:w-11 shrink-0 items-center justify-center rounded-lg md:rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-xs transition-colors">
                                            <CalendarCheck className="h-5 w-5 md:h-6 md:w-6" />
                                        </div>
                                        <div className="flex flex-col min-w-0 overflow-hidden">
                                            <p className="text-[10px] md:text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1 leading-none">
                                                Start Time
                                            </p>
                                            <p className="text-xs sm:text-sm md:text-base font-bold text-foreground tracking-tight break-words">
                                                {formatDate(contest.start_time)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* End Time */}
                                    <div className="flex items-start gap-3 md:gap-4 group min-w-0">
                                        <div className="flex h-9 w-9 md:h-11 md:w-11 shrink-0 items-center justify-center rounded-lg md:rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-xs transition-colors">
                                            <CalendarDays className="h-5 w-5 md:h-6 md:w-6" />
                                        </div>
                                        <div className="flex flex-col min-w-0 overflow-hidden">
                                            <p className="text-[10px] md:text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1 leading-none">
                                                End Time
                                            </p>
                                            <p className="text-xs sm:text-sm md:text-base font-bold text-foreground tracking-tight break-words">
                                                {formatDate(contest.end_time)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Registration Start */}
                                    <div className="flex items-start gap-3 md:gap-4 group min-w-0">
                                        <div className="flex h-9 w-9 md:h-11 md:w-11 shrink-0 items-center justify-center rounded-lg md:rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-xs transition-colors">
                                            <Timer className="h-5 w-5 md:h-6 md:w-6" />
                                        </div>
                                        <div className="flex flex-col min-w-0 overflow-hidden">
                                            <p className="text-[10px] md:text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1 leading-none">
                                                Reg Opens
                                            </p>
                                            <p className="text-xs sm:text-sm md:text-base font-bold text-foreground tracking-tight break-words">
                                                {formatDate(contest.registration_start || "")}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Registration End */}
                                    <div className="flex items-start gap-3 md:gap-4 group min-w-0">
                                        <div className="flex h-9 w-9 md:h-11 md:w-11 shrink-0 items-center justify-center rounded-lg md:rounded-xl bg-rose-50 text-rose-600 border border-rose-100 shadow-xs transition-colors">
                                            <TimerOff className="h-5 w-5 md:h-6 md:w-6" />
                                        </div>
                                        <div className="flex flex-col min-w-0 overflow-hidden">
                                            <p className="text-[10px] md:text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1 leading-none">
                                                Reg Closes
                                            </p>
                                            <p className="text-xs sm:text-sm md:text-base font-bold text-foreground tracking-tight break-words">
                                                {formatDate(contest.registration_end || "")}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator className="opacity-60" />

                        {/* Bottom Config Row */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-border/60 bg-muted/5">
                            <div className="px-4 md:px-6 py-4 md:py-5 flex items-center gap-3 md:gap-4 group transition-all hover:bg-muted/20">
                                <div className="flex h-8 w-8 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600 border border-orange-200 shadow-xs group-hover:scale-105 transition-transform">
                                    <Trophy className="h-4 w-4 md:h-5 md:w-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[9px] md:text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-0.5 md:mb-1">
                                        Scoring
                                    </p>
                                    <p className="text-xs md:text-sm font-bold text-foreground truncate">
                                        {contest.scoring_type}
                                    </p>
                                </div>
                            </div>

                            <div className="px-4 md:px-6 py-4 md:py-5 flex items-center gap-3 md:gap-4 group transition-all hover:bg-muted/20">
                                <div className="flex h-8 w-8 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 border border-emerald-200 shadow-xs group-hover:scale-105 transition-transform">
                                    <UserCheck className="h-4 w-4 md:h-5 md:w-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[9px] md:text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-0.5 md:mb-1">
                                        Approval
                                    </p>
                                    <p className="text-xs md:text-sm font-bold text-foreground truncate">
                                        {contest.team_approval_mode!.replace("_", " ")}
                                    </p>
                                </div>
                            </div>

                            <div className="px-4 md:px-6 py-4 md:py-5 flex items-center gap-3 md:gap-4 group transition-all hover:bg-muted/20">
                                <div className="flex h-8 w-8 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-600 border border-sky-200 shadow-xs group-hover:scale-105 transition-transform">
                                    <Users className="h-4 w-4 md:h-5 md:w-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[9px] md:text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-0.5 md:mb-1">
                                        Team Size
                                    </p>
                                    <p className="text-xs md:text-sm font-bold text-foreground truncate">
                                        {contest.min_team_size}-{contest.max_team_size}{" "}
                                        <span className="hidden sm:inline text-[10px] font-medium text-muted-foreground ml-0.5">
                                            MEM
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <div className="px-4 md:px-6 py-4 md:py-5 flex items-center gap-3 md:gap-4 group transition-all hover:bg-muted/20">
                                <div className="flex h-8 w-8 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-600 border border-rose-100 shadow-xs group-hover:scale-105 transition-transform">
                                    <Layers className="h-4 w-4 md:h-5 md:w-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[9px] md:text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-0.5 md:mb-1">
                                        Max Teams
                                    </p>
                                    <p className="text-xs md:text-sm font-bold text-foreground truncate">
                                        {contest.max_teams ?? "Unlimited"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
