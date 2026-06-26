"use client";

import {
    AlertCircle,
    Ban,
    BarChart3,
    ClipboardList,
    Edit,
    FileCode2,
    Loader2,
    MoreVertical,
    Play,
    Send,
    Trash2,
    UserCircle2,
    UserPlus,
    Users,
    Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
    useGetContestApiV1ContestsContestIdGet,
    useSoftDeleteContestApiV1ContestsContestIdSoftDeleteDelete,
} from "@/api/generated/contests/contests";
import type { ContestDetailResponse } from "@/api/generated/model";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { contestDetailKey, contestKeys, usePublishContest } from "@/query/contest-query";

import { AsyncStateHandler } from "../shared/async-state-handler";
import { ManagementHub } from "./management-hub";

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: React.ElementType }> =
    {
        PUBLISHED: {
            label: "Published",
            className: "bg-emerald-500/10 text-emerald-500 border-transparent",
            icon: Zap,
        },
        CANCELLED: {
            label: "Cancelled",
            className: "bg-zinc-500/10 text-zinc-400 border-transparent",
            icon: Ban,
        },
        DRAFT: {
            label: "Draft",
            className: "bg-orange-500/10 text-orange-500 border-transparent",
            icon: AlertCircle,
        },
    };

function fmt(dateStr: string | null | undefined, opts?: Intl.DateTimeFormatOptions) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString(
        undefined,
        opts ?? {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        },
    );
}

function StatCard({
    icon: Icon,
    label,
    value,
    sub,
    color = "primary",
}: {
    icon: React.ElementType;
    label: string;
    value: number | string;
    sub?: string;
    color?: "primary" | "emerald" | "blue" | "violet";
}) {
    const colorMap = {
        primary: "bg-primary/10 text-primary",
        emerald: "bg-emerald-500/10 text-emerald-500",
        blue: "bg-blue/10 text-blue",
        violet: "bg-violet-500/10 text-violet-500",
    };

    return (
        <Card className="border-border/60 shadow-sm bg-card hover:border-blue/20 transition-all duration-300">
            <CardContent className="p-4">
                <div className="flex items-center gap-3">
                    <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${colorMap[color]}`}
                    >
                        <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div>
                        <p className="text-xl font-bold text-foreground leading-none">{value}</p>
                        <p className="text-[10px] text-muted-foreground font-semibold mt-1 leading-none">
                            {label}
                        </p>
                        {sub && (
                            <p className="text-[10px] text-muted-foreground/60 mt-0.5 leading-none">
                                {sub}
                            </p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-start justify-between gap-4 py-2.5">
            <span className="text-sm text-muted-foreground shrink-0">{label}</span>
            <span className="text-sm text-foreground text-right">{value}</span>
        </div>
    );
}

function ContestDetailSkeleton() {
    return (
        <div className="space-y-6">
            {/* Hero Skeleton */}
            <Skeleton className="h-[200px] w-full rounded-xl" />

            {/* Management Hub Skeleton */}
            <div className="space-y-4">
                <Skeleton className="h-6 w-40" />
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-[140px] rounded-xl" />
                    ))}
                </div>
            </div>

            {/* Stats Skeleton */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 rounded-xl" />
                ))}
            </div>

            {/* Detail cards Skeleton */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Skeleton className="h-64 rounded-xl" />
                <Skeleton className="h-64 rounded-xl" />
            </div>
        </div>
    );
}

interface ContestDetailClientProps {
    contestId: string;
}

export function ContestDetailClient({ contestId }: ContestDetailClientProps) {
    const { data, isLoading, isError, error, refetch } =
        useGetContestApiV1ContestsContestIdGet(contestId);
    const contest: ContestDetailResponse | undefined = data?.data ?? undefined;
    const router = useRouter();

    const deleteMutation = useSoftDeleteContestApiV1ContestsContestIdSoftDeleteDelete({
        mutation: {
            meta: {
                successMessage: "Contest deleted successfully",
                invalidateKeys: [contestKeys()],
            },
            onSuccess: () => {
                router.push("/contest");
            },
        },
    });

    const publishMutation = usePublishContest({
        mutation: {
            meta: {
                successMessage: "Contest published successfully",
                invalidateKeys: [contestKeys(), contestDetailKey(contestId)],
            },
        },
    });

    const handleDeleteContest = () => deleteMutation.mutate({ contestId });
    const handlePublish = () => publishMutation.mutate({ contestId });

    const statusCfg = (() => {
        if (!contest) return STATUS_CONFIG.DRAFT;
        if (contest.status === "DRAFT") return STATUS_CONFIG.DRAFT;
        if (contest.status === "CANCELLED") return STATUS_CONFIG.CANCELLED;
        return STATUS_CONFIG.PUBLISHED;
    })();

    const duration =
        contest && contest.end_time
            ? (() => {
                  const ms =
                      new Date(contest.end_time).getTime() - new Date(contest.start_time).getTime();
                  const h = Math.floor(ms / 3_600_000);
                  const m = Math.floor((ms % 3_600_000) / 60_000);
                  return h > 0 ? `${h}h ${m > 0 ? m + "m" : ""}`.trim() : `${m}m`;
              })()
            : "Not Scheduled";

    return (
        <AsyncStateHandler
            isLoading={isLoading}
            isError={isError || (!isLoading && !contest)}
            error={error}
            onRetry={refetch}
            errorTitle="Contest Not Found"
            loadingComponent={<ContestDetailSkeleton />}
        >
            {contest && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column (Main Information and Management) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Hero */}
                        <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-card p-6 shadow-sm">
                            {/* Brand identity gradient top bar */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-maroon via-blue via-red to-gold" />
                            {contest.image && (
                                <div
                                    className="absolute inset-0 opacity-5 bg-cover bg-center"
                                    style={{ backgroundImage: `url(${contest.image})` }}
                                />
                            )}
                            <div className="relative flex flex-col gap-4">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex flex-wrap items-center gap-2">
                                        {contest.run_status.toLowerCase() === "live" ? (
                                            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red/10 text-red text-[11px] font-black uppercase tracking-wider border border-red/20">
                                                <span className="h-1.5 w-1.5 rounded-full bg-red animate-pulse" />
                                                Live
                                            </div>
                                        ) : (
                                            <Badge
                                                variant="outline"
                                                className="border-border/60 text-muted-foreground capitalize text-[10px] font-semibold bg-muted/30"
                                            >
                                                {contest.run_status.toLowerCase()}
                                            </Badge>
                                        )}
                                        <Badge
                                            variant="outline"
                                            className="border-border/60 text-muted-foreground text-[10px] font-semibold bg-muted/30"
                                        >
                                            {statusCfg.label}
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className="border-border/60 text-muted-foreground text-[10px] font-semibold capitalize bg-muted/30"
                                        >
                                            {contest.contest_mode} Mode
                                        </Badge>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-border/40 bg-background/50 hover:bg-background/80 transition-colors text-xs font-semibold cursor-pointer"
                                            asChild
                                        >
                                            <Link href={`/contest/${contest.id}?edit=1`}>
                                                <Edit className="mr-1.5 h-3.5 w-3.5" />
                                                Edit
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-border/40 bg-background/50 hover:bg-background/80 transition-colors text-xs font-semibold cursor-pointer"
                                        >
                                            <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                                            Invite
                                        </Button>

                                        {(contest.status as string) === "DRAFT" && (
                                            <Button
                                                size="sm"
                                                className="bg-red hover:bg-red/90 text-white border-transparent shadow-sm text-xs font-semibold cursor-pointer transition-all duration-200"
                                                onClick={handlePublish}
                                                disabled={publishMutation.isPending}
                                            >
                                                {publishMutation.isPending ? (
                                                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                                ) : (
                                                    <Play className="mr-1.5 h-3.5 w-3.5 fill-current" />
                                                )}
                                                Publish
                                            </Button>
                                        )}

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-9 w-9 border-border/40 bg-background/50 hover:bg-background/80 cursor-pointer"
                                                    aria-label="Contest actions"
                                                >
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuItem
                                                    className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer text-xs"
                                                    disabled={deleteMutation.isPending}
                                                    onClick={handleDeleteContest}
                                                >
                                                    {deleteMutation.isPending ? (
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                    )}
                                                    {deleteMutation.isPending
                                                        ? "Deleting..."
                                                        : "Delete Contest"}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>

                                <div>
                                    <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">
                                        {contest.name}
                                    </h1>
                                    {contest.description && (
                                        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                                            {contest.description}
                                        </p>
                                    )}
                                    {contest.creator && (
                                        <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground pt-4 border-t border-border/20">
                                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-maroon/10 text-maroon font-bold text-[10px]">
                                                {(
                                                    contest.creator.name ||
                                                    contest.creator.email ||
                                                    "U"
                                                )
                                                    .substring(0, 2)
                                                    .toUpperCase()}
                                            </div>
                                            <span>
                                                Created by{" "}
                                                <strong className="text-foreground font-semibold">
                                                    {contest.creator.name || contest.creator.email}
                                                </strong>
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Management Hub */}
                        <ManagementHub contest={contest} />

                        {/* Rules */}
                        {contest.rules && (
                            <Card className="border-border/60 shadow-sm rounded-2xl overflow-hidden bg-card">
                                <CardHeader className="pb-3 pt-5 px-5 bg-muted/10 border-b border-border/40">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                        <BarChart3 className="h-4 w-4 text-maroon" />
                                        Rules & Regulations
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap font-sans">
                                        {contest.rules}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column (Sidebar / Telemetry & Specs) */}
                    <div className="space-y-6">
                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <StatCard
                                icon={Users}
                                label="Teams"
                                value={contest.team_count ?? 0}
                                color="blue"
                            />
                            <StatCard
                                icon={FileCode2}
                                label="Questions"
                                value={contest.question_count ?? 0}
                                color="blue"
                            />
                            <StatCard
                                icon={Send}
                                label="Submissions"
                                value={contest.submission_count ?? 0}
                                color="blue"
                            />
                            <StatCard
                                icon={UserCircle2}
                                label="Participants"
                                value={contest.participant_count ?? 0}
                                color="blue"
                            />
                        </div>

                        {/* Specifications Card (Combined Schedule & Configuration) */}
                        <Card className="border-border/60 shadow-sm rounded-2xl overflow-hidden bg-card">
                            <CardHeader className="pb-3 pt-5 px-5 bg-muted/10 border-b border-border/40">
                                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                    <ClipboardList className="h-4 w-4 text-blue" />
                                    Specifications
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 divide-y divide-border/20">
                                {/* Schedule Section */}
                                <div className="px-5 py-4">
                                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                                        Schedule
                                    </h3>
                                    <div className="space-y-1 divide-y divide-border/10">
                                        <InfoRow label="Start" value={fmt(contest.start_time)} />
                                        <InfoRow label="End" value={fmt(contest.end_time)} />
                                        {contest.registration_start && (
                                            <InfoRow
                                                label="Reg. Opens"
                                                value={fmt(contest.registration_start)}
                                            />
                                        )}
                                        {contest.registration_end && (
                                            <InfoRow
                                                label="Reg. Closes"
                                                value={fmt(contest.registration_end)}
                                            />
                                        )}
                                        <InfoRow label="Duration" value={duration} />
                                        {contest.duration !== null &&
                                            contest.duration !== undefined && (
                                                <InfoRow
                                                    label="Session Duration"
                                                    value={(() => {
                                                        const h = Math.floor(
                                                            contest.duration / 3600,
                                                        );
                                                        const m = Math.floor(
                                                            (contest.duration % 3600) / 60,
                                                        );
                                                        return h > 0
                                                            ? `${h}h ${m > 0 ? m + "m" : ""}`.trim()
                                                            : `${m}m`;
                                                    })()}
                                                />
                                            )}
                                    </div>
                                </div>

                                {/* Configuration Section */}
                                <div className="px-5 py-4">
                                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                                        Parameters
                                    </h3>
                                    <div className="space-y-1 divide-y divide-border/10">
                                        <InfoRow
                                            label="Mode"
                                            value={
                                                <span className="capitalize font-medium">
                                                    {contest.contest_mode} Mode
                                                </span>
                                            }
                                        />
                                        <InfoRow
                                            label="Team size"
                                            value={`${contest.min_team_size ?? 1} – ${contest.max_team_size ?? "∞"} members`}
                                        />
                                        <InfoRow
                                            label="Max teams"
                                            value={contest.max_teams ?? "Unlimited"}
                                        />
                                        <InfoRow
                                            label="Team approval"
                                            value={
                                                <Badge
                                                    variant="outline"
                                                    className="border-border/60 text-[10px] capitalize bg-muted/40 text-muted-foreground font-semibold"
                                                >
                                                    {(contest.team_approval_mode ?? "—")
                                                        .replace("_", " ")
                                                        .toLowerCase()}
                                                </Badge>
                                            }
                                        />
                                        <InfoRow
                                            label="Scoring type"
                                            value={
                                                <Badge
                                                    variant="outline"
                                                    className="border-gold/30 bg-gold/10 text-gold text-[10px] font-bold uppercase tracking-wider"
                                                >
                                                    {contest.scoring_type ?? "—"}
                                                </Badge>
                                            }
                                        />
                                        <InfoRow
                                            label="During Contest"
                                            value={
                                                contest.show_leaderboard_during_contest
                                                    ? "Leaderboard Visible"
                                                    : "Leaderboard Hidden"
                                            }
                                        />
                                        <InfoRow
                                            label="Evaluation"
                                            value={
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        contest.evaluate_on_submit
                                                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-semibold"
                                                            : "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20 text-[10px] font-semibold"
                                                    }
                                                >
                                                    {contest.evaluate_on_submit
                                                        ? "Immediate"
                                                        : "On Session Finish"}
                                                </Badge>
                                            }
                                        />
                                        {contest.contest_mode === "team" &&
                                            contest.participation_type && (
                                                <InfoRow
                                                    label="Participation"
                                                    value={
                                                        <Badge
                                                            variant="outline"
                                                            className="border-border/60 text-[10px] capitalize bg-muted/40 text-muted-foreground font-semibold"
                                                        >
                                                            {contest.participation_type
                                                                .replace(/_/g, " ")
                                                                .toLowerCase()}
                                                        </Badge>
                                                    }
                                                />
                                            )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Meta timestamps */}
                    <div className="lg:col-span-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-muted-foreground pt-4 border-t border-border/20 mt-2">
                        <span>
                            Created{" "}
                            {fmt(contest.created_at, {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                            })}
                        </span>
                        <span>
                            Updated{" "}
                            {fmt(contest.updated_at, {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                            })}
                        </span>
                        {contest.published_at && (
                            <span>
                                Published{" "}
                                {fmt(contest.published_at, {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </span>
                        )}
                    </div>
                </div>
            )}
        </AsyncStateHandler>
    );
}
