"use client";

import {
    BarChart3,
    Calendar,
    ClipboardList,
    Clock,
    Code2,
    Edit,
    Globe,
    Loader2,
    Lock,
    Play,
    Trash2,
    UserCircle2,
    UserRoundCheck,
    Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
    useGetContestApiV1ContestsContestIdGet,
    useSoftDeleteContestApiV1ContestsContestIdSoftDeleteDelete,
} from "@/api/generated/contests/contests";
import type { ContestDetailResponse } from "@/api/generated/model";
import { useGetContestTeamsApiV1ContestsContestIdTeamsGet } from "@/api/generated/teams/teams";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { contestDetailKey, contestKeys, usePublishContest } from "@/query/contest-query";

import { AsyncStateHandler } from "../shared/async-state-handler";
import { ContestTeamsClient } from "../teams/contest-teams-client";
import { ContestQuestionsClient } from "./contest-questions-client";

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

            {/* Nav stats Skeleton */}
            <div className="space-y-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-[104px] rounded-xl" />
                    ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <Skeleton key={i} className="h-[68px] rounded-xl" />
                    ))}
                </div>
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

    const { data: teamsData } = useGetContestTeamsApiV1ContestsContestIdTeamsGet(
        contestId,
        { page: 1, page_size: 1 },
        { query: { enabled: !!contest } },
    );
    const waitingCount = teamsData?.data?.waiting_count ?? 0;

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
                    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#081326] p-7 text-white shadow-[0_24px_60px_-28px_rgba(2,6,23,0.8)] md:p-8">
                        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(118deg,color-mix(in_srgb,var(--primary)_66%,#17356b),#081326_78%)] opacity-90" />
                        <div className="pointer-events-none absolute -left-16 -top-36 size-[28rem] rounded-full bg-primary/45 blur-3xl" />
                        <div className="pointer-events-none absolute -bottom-40 right-1/4 size-80 rounded-full bg-primary/25 blur-3xl" />
                        <div className="pointer-events-none absolute inset-0 opacity-15 [background-image:radial-gradient(circle_at_center,white_1px,transparent_1.3px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_82%)]" />
                        <Code2 className="pointer-events-none absolute -bottom-16 -right-5 size-56 rotate-[-5deg] text-white/[0.07]" />
                        {contest.image && (
                            <div
                                className="absolute inset-0 opacity-10 bg-cover bg-center"
                                style={{ backgroundImage: `url(${contest.image})` }}
                            />
                        )}
                        <div className="relative z-10">
                            <div className="mb-7 flex flex-wrap items-start justify-between gap-5">
                                <div className="flex flex-wrap items-start gap-3">
                                    <Badge
                                        variant="outline"
                                        className="flex items-center gap-2 border-transparent px-3 py-1.5 text-xs font-bold shadow-sm"
                                        style={{
                                            backgroundColor: "var(--contrast-accent)",
                                            color: "var(--contrast-foreground)",
                                        }}
                                    >
                                        {contest.is_public ? (
                                            <Globe className="h-3.5 w-3.5" />
                                        ) : (
                                            <Lock className="h-3.5 w-3.5" />
                                        )}
                                        {contest.is_public ? "Public" : "Private"}
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        className="gap-2 border-violet-300/25 bg-violet-400/20 px-3 py-1.5 text-xs font-semibold text-violet-100 capitalize backdrop-blur-md"
                                    >
                                        <span className="size-1.5 rounded-full bg-violet-300" />
                                        {contest.contest_mode}
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        className="gap-2 border-emerald-300/30 bg-emerald-400/20 px-3 py-1.5 text-xs font-semibold text-emerald-200 capitalize backdrop-blur-md"
                                    >
                                        <span className="size-1.5 rounded-full bg-emerald-300 shadow-[0_0_8px_currentColor]" />
                                        {contest.run_status}
                                    </Badge>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        className="h-10 border-sky-300/30 bg-sky-400/20 px-4 text-sky-100 backdrop-blur-md hover:bg-sky-400/30 hover:text-white"
                                        asChild
                                    >
                                        <Link href={`/contest/${contest.id}?edit=1`}>
                                            <Edit className="mr-1.5 h-3.5 w-3.5" />
                                            Edit
                                        </Link>
                                    </Button>
                                    <Button
                                        className="h-10 border-0 px-4 font-semibold shadow-md shadow-black/20"
                                        style={{
                                            backgroundColor: "var(--contrast-accent)",
                                            color: "var(--contrast-foreground)",
                                        }}
                                        asChild
                                    >
                                        <Link href={`/contest/${contest.id}/evaluate`}>
                                            <BarChart3 className="mr-1.5 h-4 w-4" />
                                            Results
                                        </Link>
                                    </Button>

                                    {(contest.status as string) === "DRAFT" && (
                                        <Button
                                            className="h-10 bg-emerald-600 px-4 text-white shadow-md shadow-emerald-500/15 hover:bg-emerald-500"
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

                                    <Button
                                        variant="outline"
                                        className="h-10 border-red-300/35 bg-red-500/15 px-4 text-red-100 backdrop-blur-md hover:bg-red-500/25 hover:text-white"
                                        disabled={deleteMutation.isPending}
                                        onClick={handleDeleteContest}
                                    >
                                        {deleteMutation.isPending ? (
                                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                        )}
                                        {deleteMutation.isPending ? "Deleting..." : "Delete"}
                                    </Button>
                                </div>
                            </div>

                            <h1 className="mb-2 max-w-4xl text-3xl font-bold tracking-[-0.03em] text-white md:text-4xl">
                                {contest.name}
                            </h1>
                            {contest.description && (
                                <p className="max-w-3xl text-sm leading-relaxed text-slate-300 md:text-base">
                                    {contest.description}
                                </p>
                            )}

                            <div className="mt-8 grid max-w-6xl gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                <div className="rounded-2xl border border-white/10 bg-[#081326]/55 p-4 backdrop-blur-md">
                                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                                        <Calendar className="size-4 text-primary" />
                                        Starts
                                    </div>
                                    <p className="text-sm font-semibold text-white">
                                        {fmt(contest.start_time)}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-[#081326]/55 p-4 backdrop-blur-md">
                                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                                        <Calendar className="size-4 text-contrast" />
                                        Ends
                                    </div>
                                    <p className="text-sm font-semibold text-white">
                                        {fmt(contest.end_time)}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-[#081326]/55 p-4 backdrop-blur-md">
                                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                                        <Clock className="size-4 text-emerald-400" />
                                        Duration
                                    </div>
                                    <p className="text-sm font-semibold text-white">{duration}</p>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-[#081326]/55 p-4 backdrop-blur-md">
                                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                                        <UserRoundCheck className="size-4 text-violet-300" />
                                        Registration
                                    </div>
                                    {contest.registration_start || contest.registration_end ? (
                                        <div className="space-y-1 text-xs text-slate-300">
                                            <p>
                                                <span className="text-slate-500">Opens </span>
                                                {fmt(contest.registration_start)}
                                            </p>
                                            <p>
                                                <span className="text-slate-500">Closes </span>
                                                {fmt(contest.registration_end)}
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-sm font-semibold text-white">
                                            No registration window
                                        </p>
                                    )}
                                </div>
                            </div>

                            {contest.creator && (
                                <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                                    <UserCircle2 className="size-4" />
                                    Created by {contest.creator.name || contest.creator.email}
                                </div>
                            )}
                        </div>
                    </div>

                    <Card className="overflow-hidden border-border/60 p-0">
                        <Tabs
                            id="questions"
                            defaultValue="questions"
                            className="gap-0 scroll-mt-20"
                        >
                            <div className="border-b border-border/60 bg-primary/5 p-4">
                                <TabsList className="grid h-auto w-full max-w-xl grid-cols-2 rounded-xl bg-muted/60 p-1.5">
                                    <TabsTrigger
                                        value="questions"
                                        className="gap-2 rounded-lg py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                                    >
                                        <Code2 className="size-4" />
                                        Questions
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="teams"
                                        className="gap-2 rounded-lg py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                                    >
                                        <Users className="size-4" />
                                        Team Requests
                                        {waitingCount > 0 && (
                                            <span className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[11px] font-bold text-white">
                                                {waitingCount}
                                            </span>
                                        )}
                                    </TabsTrigger>
                                </TabsList>
                            </div>
                            <TabsContent value="questions" className="m-0">
                                <ContestQuestionsClient contestId={contest.id} embedded />
                            </TabsContent>
                            <TabsContent value="teams" className="m-0">
                                <ContestTeamsClient contestId={contest.id} embedded />
                            </TabsContent>
                        </Tabs>
                    </Card>

                    {/* Detail cards */}
                    <div className="hidden grid-cols-1 gap-6 md:grid-cols-2">
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
                                {contest.duration !== null && contest.duration !== undefined && (
                                    <>
                                        <Separator className="my-0.5 bg-border/40" />
                                        <InfoRow
                                            label="Session duration"
                                            value={(() => {
                                                const h = Math.floor(contest.duration / 3600);
                                                const m = Math.floor(
                                                    (contest.duration % 3600) / 60,
                                                );
                                                return h > 0
                                                    ? `${h}h ${m > 0 ? m + "m" : ""}`.trim()
                                                    : `${m}m`;
                                            })()}
                                        />
                                    </>
                                )}
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
                                    label="During Contest"
                                    value={
                                        contest.show_leaderboard_during_contest
                                            ? "Visible"
                                            : "Hidden"
                                    }
                                />
                                <Separator className="my-0.5 bg-border/40" />
                                <InfoRow
                                    label="Question Order"
                                    value={
                                        contest.shuffle_questions
                                            ? "Shuffled per participant"
                                            : "Fixed order"
                                    }
                                />
                                <Separator className="my-0.5 bg-border/40" />
                                <InfoRow
                                    label="Evaluation Mode"
                                    value={
                                        <Badge
                                            variant="outline"
                                            className={
                                                contest.evaluate_on_submit
                                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                                    : "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20"
                                            }
                                        >
                                            {contest.evaluate_on_submit
                                                ? "Immediate"
                                                : "On Session Finish"}
                                        </Badge>
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
