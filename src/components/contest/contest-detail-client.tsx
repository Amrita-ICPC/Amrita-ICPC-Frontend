"use client";

import {
    Calendar,
    Users,
    FileCode2,
    Send,
    UserCircle2,
    Clock,
    Globe,
    Lock,
    BarChart3,
    AlertCircle,
    Loader2,
    Zap,
    ClipboardList,
    Edit,
    Play,
    MoreVertical,
    Trash2,
    UserPlus,
    Pause,
    Ban,
} from "lucide-react";
import Link from "next/link";

import { useRouter } from "next/navigation";

import {
    useGetContestApiV1ContestsContestIdGet,
    usePauseContestApiV1ContestsContestIdPausePost,
    useResumeContestApiV1ContestsContestIdResumePost,
    useCancelContestApiV1ContestsContestIdCancelPost,
    useSoftDeleteContestApiV1ContestsContestIdSoftDeleteDelete,
} from "@/api/generated/contests/contests";
import {
    useDeleteContest,
    contestKeys,
    usePublishContest,
    contestDetailKey,
} from "@/query/contest-query";
import { useQueryClient } from "@tanstack/react-query";

import type { ContestDetailResponse } from "@/api/generated/model";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ManagementHub } from "./management-hub";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { AsyncStateHandler } from "../shared/async-state-handler";

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: React.ElementType }> =
    {
        PUBLISHED: {
            label: "Published",
            className: "bg-emerald-500/10 text-emerald-500 border-transparent",
            icon: Zap,
        },
        PAUSED: {
            label: "Paused",
            className: "bg-blue-500/10 text-blue-500 border-transparent",
            icon: Pause,
        },
        CANCELLED: {
            label: "Cancelled",
            className: "bg-zinc-500/10 text-zinc-400 border-transparent",
            icon: Ban,
        },
        FINISHED: {
            label: "Finished",
            className: "bg-zinc-500/10 text-zinc-400 border-transparent",
            icon: Clock,
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
        blue: "bg-blue-500/10 text-blue-500",
        violet: "bg-violet-500/10 text-violet-500",
    };

    return (
        <Card className="border-border/60">
            <CardContent className="p-5">
                <div className="flex items-center gap-3">
                    <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${colorMap[color]}`}
                    >
                        <Icon className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-foreground">{value}</p>
                        <p className="text-xs text-muted-foreground">{label}</p>
                        {sub && <p className="text-xs text-muted-foreground/60 mt-0.5">{sub}</p>}
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
    const queryClient = useQueryClient();
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

    const pauseMutation = usePauseContestApiV1ContestsContestIdPausePost({
        mutation: {
            meta: {
                successMessage: "Contest paused successfully",
                invalidateKeys: [contestKeys(), contestDetailKey(contestId)],
            },
        },
    });

    const resumeMutation = useResumeContestApiV1ContestsContestIdResumePost({
        mutation: {
            meta: {
                successMessage: "Contest resumed successfully",
                invalidateKeys: [contestKeys(), contestDetailKey(contestId)],
            },
        },
    });

    const cancelMutation = useCancelContestApiV1ContestsContestIdCancelPost({
        mutation: {
            meta: {
                successMessage: "Contest cancelled successfully",
                invalidateKeys: [contestKeys(), contestDetailKey(contestId)],
            },
        },
    });

    const handleDeleteContest = () => deleteMutation.mutate({ contestId });
    const handlePublish = () => publishMutation.mutate({ contestId });
    const handlePause = () => pauseMutation.mutate({ contestId });
    const handleResume = () => resumeMutation.mutate({ contestId });
    const handleCancel = () => cancelMutation.mutate({ contestId });

    const statusCfg = (() => {
        if (!contest) return STATUS_CONFIG.DRAFT;
        if (contest.status === "DRAFT") return STATUS_CONFIG.DRAFT;
        if (contest.contest_runtime_status === "PAUSED") return STATUS_CONFIG.PAUSED;
        if (contest.contest_runtime_status === "CANCELLED") return STATUS_CONFIG.CANCELLED;
        if (contest.contest_runtime_status === "FINISHED") return STATUS_CONFIG.FINISHED;
        return STATUS_CONFIG.PUBLISHED;
    })();
    const StatusIcon = statusCfg.icon;

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
                <div className="space-y-6">
                    {/* Hero */}
                    <div className="relative overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br from-card via-card to-primary/5 p-6">
                        {contest.image && (
                            <div
                                className="absolute inset-0 opacity-10 bg-cover bg-center"
                                style={{ backgroundImage: `url(${contest.image})` }}
                            />
                        )}
                        <div className="relative">
                            <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                                <div className="flex flex-wrap items-start gap-3">
                                    <Badge
                                        variant="outline"
                                        className={`${statusCfg.className} flex items-center gap-1.5`}
                                    >
                                        <StatusIcon className="h-3 w-3" />
                                        {statusCfg.label}
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        className="border-border/60 text-muted-foreground flex items-center gap-1.5"
                                    >
                                        {contest.is_public ? (
                                            <Globe className="h-3 w-3" />
                                        ) : (
                                            <Lock className="h-3 w-3" />
                                        )}
                                        {contest.is_public ? "Public" : "Private"}
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        className="border-border/60 text-muted-foreground capitalize"
                                    >
                                        {contest.contest_mode}
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        className="border-border/60 text-muted-foreground capitalize"
                                    >
                                        {contest.run_status}
                                    </Badge>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="bg-background/50 backdrop-blur-sm hover:bg-background/80"
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
                                        className="bg-background/50 backdrop-blur-sm hover:bg-background/80"
                                    >
                                        <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                                        Invite
                                    </Button>

                                    {(contest.status as string) === "DRAFT" && (
                                        <Button
                                            size="sm"
                                            className="shadow-sm"
                                            onClick={handlePublish}
                                            disabled={publishMutation.isPending}
                                        >
                                            {publishMutation.isPending ? (
                                                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                            ) : (
                                                <Play className="mr-1.5 h-3.5 w-3.5" />
                                            )}
                                            Publish
                                        </Button>
                                    )}

                                    {contest.status === "PUBLISHED" && (
                                        <>
                                            {(!contest.contest_runtime_status ||
                                                contest.contest_runtime_status === "RUNNING" ||
                                                contest.contest_runtime_status === "SCHEDULED") && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="shadow-sm border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20"
                                                    onClick={handlePause}
                                                    disabled={pauseMutation.isPending}
                                                >
                                                    {pauseMutation.isPending ? (
                                                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                                    ) : (
                                                        <Pause className="mr-1.5 h-3.5 w-3.5" />
                                                    )}
                                                    Pause
                                                </Button>
                                            )}

                                            {contest.contest_runtime_status === "PAUSED" && (
                                                <Button
                                                    size="sm"
                                                    className="shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white"
                                                    onClick={handleResume}
                                                    disabled={resumeMutation.isPending}
                                                >
                                                    {resumeMutation.isPending ? (
                                                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                                    ) : (
                                                        <Play className="mr-1.5 h-3.5 w-3.5" />
                                                    )}
                                                    Resume
                                                </Button>
                                            )}

                                            {contest.contest_runtime_status !== "FINISHED" &&
                                                contest.contest_runtime_status !== "CANCELLED" && (
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        className="shadow-sm"
                                                        onClick={handleCancel}
                                                        disabled={cancelMutation.isPending}
                                                    >
                                                        {cancelMutation.isPending ? (
                                                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                                        ) : (
                                                            <Ban className="mr-1.5 h-3.5 w-3.5" />
                                                        )}
                                                        Cancel
                                                    </Button>
                                                )}
                                        </>
                                    )}

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-9 w-9 bg-background/50 backdrop-blur-sm hover:bg-background/80"
                                            >
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48">
                                            <DropdownMenuItem
                                                className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
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

                            <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">
                                {contest.name}
                            </h1>
                            {contest.description && (
                                <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                                    {contest.description}
                                </p>
                            )}

                            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="h-4 w-4" />
                                    <span>
                                        {fmt(contest.start_time)} — {fmt(contest.end_time)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Clock className="h-4 w-4" />
                                    <span>{duration} duration</span>
                                </div>
                                {contest.creator && (
                                    <div className="flex items-center gap-1.5">
                                        <UserCircle2 className="h-4 w-4" />
                                        <span>
                                            by {contest.creator.name || contest.creator.email}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Management Hub */}
                    <ManagementHub contest={contest} />

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        <StatCard
                            icon={Users}
                            label="Teams"
                            value={contest.team_count ?? 0}
                            color="primary"
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
                            color="violet"
                        />
                        <StatCard
                            icon={UserCircle2}
                            label="Participants"
                            value={contest.participant_count ?? 0}
                            color="emerald"
                        />
                    </div>

                    {/* Detail cards */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Schedule */}
                        <Card className="border-border/60">
                            <CardHeader className="pb-2 pt-5 px-5">
                                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                    <Calendar className="h-4 w-4 text-primary" />
                                    Schedule
                                </div>
                            </CardHeader>
                            <CardContent className="px-5 pb-5">
                                <Separator className="mb-3" />
                                <InfoRow label="Start" value={fmt(contest.start_time)} />
                                <Separator className="my-0.5 bg-border/40" />
                                <InfoRow label="End" value={fmt(contest.end_time)} />
                                {contest.registration_start && (
                                    <>
                                        <Separator className="my-0.5 bg-border/40" />
                                        <InfoRow
                                            label="Reg. opens"
                                            value={fmt(contest.registration_start)}
                                        />
                                    </>
                                )}
                                {contest.registration_end && (
                                    <>
                                        <Separator className="my-0.5 bg-border/40" />
                                        <InfoRow
                                            label="Reg. closes"
                                            value={fmt(contest.registration_end)}
                                        />
                                    </>
                                )}
                                <Separator className="my-0.5 bg-border/40" />
                                <InfoRow label="Duration" value={duration} />
                            </CardContent>
                        </Card>

                        {/* Settings */}
                        <Card className="border-border/60">
                            <CardHeader className="pb-2 pt-5 px-5">
                                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                    <ClipboardList className="h-4 w-4 text-primary" />
                                    Configuration
                                </div>
                            </CardHeader>
                            <CardContent className="px-5 pb-5">
                                <Separator className="mb-3" />
                                <InfoRow
                                    label="Mode"
                                    value={
                                        <span className="capitalize">{contest.contest_mode}</span>
                                    }
                                />
                                <Separator className="my-0.5 bg-border/40" />
                                <InfoRow
                                    label="Team size"
                                    value={`${contest.min_team_size ?? 1} – ${contest.max_team_size ?? "∞"} members`}
                                />
                                <Separator className="my-0.5 bg-border/40" />
                                <InfoRow
                                    label="Max teams"
                                    value={contest.max_teams ?? "Unlimited"}
                                />
                                <Separator className="my-0.5 bg-border/40" />
                                <InfoRow
                                    label="Team approval"
                                    value={
                                        <Badge
                                            variant="outline"
                                            className="border-border/60 text-xs capitalize"
                                        >
                                            {(contest.team_approval_mode ?? "—")
                                                .replace("_", " ")
                                                .toLowerCase()}
                                        </Badge>
                                    }
                                />
                                <Separator className="my-0.5 bg-border/40" />
                                <InfoRow
                                    label="Scoring"
                                    value={
                                        <Badge
                                            variant="outline"
                                            className="border-border/60 text-xs"
                                        >
                                            {contest.scoring_type ?? "—"}
                                        </Badge>
                                    }
                                />
                                <Separator className="my-0.5 bg-border/40" />
                                <Separator className="my-0.5 bg-border/40" />
                                <InfoRow
                                    label="During Contest"
                                    value={
                                        contest.show_leaderboard_during_contest
                                            ? "Visible"
                                            : "Hidden"
                                    }
                                />
                                {contest.contest_mode === "team" && contest.participation_type && (
                                    <>
                                        <Separator className="my-0.5 bg-border/40" />
                                        <InfoRow
                                            label="Participation type"
                                            value={
                                                <Badge
                                                    variant="outline"
                                                    className="border-border/60 text-xs capitalize"
                                                >
                                                    {contest.participation_type
                                                        .replace(/_/g, " ")
                                                        .toLowerCase()}
                                                </Badge>
                                            }
                                        />
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Rules */}
                    {contest.rules && (
                        <Card className="border-border/60">
                            <CardHeader className="pb-2 pt-5 px-5">
                                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                    <BarChart3 className="h-4 w-4 text-primary" />
                                    Rules
                                </div>
                            </CardHeader>
                            <CardContent className="px-5 pb-5">
                                <Separator className="mb-3" />
                                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                    {contest.rules}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-muted-foreground">
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
