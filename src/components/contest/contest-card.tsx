"use client";

import { ArrowRight, Calendar, Clock3, Lock, ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import AuthGuard from "@/components/global/auth-guard";
import { Roles } from "@/lib/auth/utils";
import { toApiError } from "@/lib/api/error";
import { useSoftDeleteContest } from "@/query/contest-query";
import type { ContestSummaryResponse } from "@/api/generated/model";
import {
    formatContestDateTime,
    formatContestLabel,
    getContestModeBadgeClass,
    getContestStatusBadgeClass,
    isAllowedContestImage,
} from "./contest-util";

// ─── Helpers ────────────────────────────────────────────────────────────────

// ─── Fallback Banner ─────────────────────────────────────────────────────────

function ContestFallbackBanner({ id, name }: { id: string; name: string }) {
    const bgId = `cb-bg-${id}`;
    const glowId = `cb-glow-${id}`;
    const displayName = name.length > 28 ? name.slice(0, 28) + "…" : name;

    return (
        <svg
            viewBox="0 0 640 360"
            xmlns="http://www.w3.org/2000/svg"
            className="h-full w-full transition-transform duration-500 group-hover:scale-105"
            aria-hidden="true"
        >
            <defs>
                <linearGradient id={bgId} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#1e1b4b" />
                    <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>
                <linearGradient id={glowId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                </linearGradient>
            </defs>

            {/* Background */}
            <rect width="640" height="360" fill={`url(#${bgId})`} />

            {/* Glow blob */}
            <ellipse cx="320" cy="130" rx="220" ry="120" fill={`url(#${glowId})`} />

            {/* Dot grid */}
            {Array.from({ length: 10 }, (_, col) =>
                Array.from({ length: 6 }, (_, row) => (
                    <circle
                        key={`${col}-${row}`}
                        cx={44 + col * 62}
                        cy={30 + row * 60}
                        r="1.5"
                        fill="#6366f1"
                        opacity="0.2"
                    />
                )),
            )}

            {/* Decorative brackets */}
            <text
                x="52"
                y="210"
                fontSize="120"
                fontFamily="monospace"
                fontWeight="bold"
                fill="#6366f1"
                opacity="0.12"
            >{`{`}</text>
            <text
                x="510"
                y="210"
                fontSize="120"
                fontFamily="monospace"
                fontWeight="bold"
                fill="#6366f1"
                opacity="0.12"
            >{`}`}</text>

            {/* Trophy icon */}
            <g transform="translate(296, 98)" fill="#a5b4fc" opacity="0.9">
                <path d="M24 0H0v18c0 9.9 6.9 18.2 16 20.5V44H8v4h32v-4H28V38.5C37.1 36.2 44 27.9 44 18V0H20zM4 18V4h12v24.3C10.1 26.6 4 22.7 4 18zm36 0c0 4.7-6.1 8.6-12 10.3V4h12v14z" />
            </g>

            {/* "CONTEST" label */}
            <text
                x="320"
                y="178"
                textAnchor="middle"
                fontSize="11"
                fontFamily="system-ui,sans-serif"
                letterSpacing="3"
                fill="#a5b4fc"
                opacity="0.7"
            >
                CONTEST
            </text>

            {/* Contest name */}
            <text
                x="320"
                y="215"
                textAnchor="middle"
                fontSize="22"
                fontWeight="bold"
                fontFamily="system-ui,sans-serif"
                fill="white"
                opacity="0.95"
            >
                {displayName}
            </text>

            {/* Accent underline */}
            <rect x="240" y="232" width="160" height="2" rx="1" fill="#6366f1" opacity="0.5" />
        </svg>
    );
}

// ─── Status colours ───────────────────────────────────────────────────────────

// ─── ContestCard ─────────────────────────────────────────────────────────────

interface ContestCardProps {
    contest: ContestSummaryResponse;
}

export function ContestCard({ contest }: ContestCardProps) {
    const [imageError, setImageError] = useState(false);
    const softDeleteMutation = useSoftDeleteContest();

    const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
    const [errorDialogMessage, setErrorDialogMessage] = useState<string>(
        "Failed to delete contest",
    );
    const [errorDialogStatus, setErrorDialogStatus] = useState<number | undefined>(undefined);

    function onSoftDelete() {
        softDeleteMutation.mutate(contest.id, {
            onError: (error) => {
                const apiError = toApiError(error);
                setErrorDialogMessage(apiError.detail ?? apiError.message);
                setErrorDialogStatus(apiError.status);
                setIsErrorDialogOpen(true);
            },
        });
    }

    const startDate = formatContestDateTime(contest.start_time);
    const endDate = formatContestDateTime(contest.end_time);
    const createdAt = formatContestDateTime(contest.created_at);

    // Use onError to handle any broken/invalid/unconfigured URL silently.
    const showImage = isAllowedContestImage(contest.image) && !imageError;

    return (
        <>
            <Dialog open={isErrorDialogOpen} onOpenChange={setIsErrorDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Soft delete failed</DialogTitle>
                        <DialogDescription>
                            {errorDialogStatus ? `Status: ${errorDialogStatus}` : ""}
                        </DialogDescription>
                    </DialogHeader>
                    <Alert variant="destructive">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                            <p>{errorDialogMessage}</p>
                        </AlertDescription>
                    </Alert>
                    <div className="flex justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsErrorDialogOpen(false)}
                        >
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Card className="w-full max-w-[500px] group flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-white/5 border-transparent bg-gradient-to-b from-card to-card/50">
                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                    {showImage ? (
                        <>
                            <Image
                                src={contest.image ?? ""}
                                alt={contest.name}
                                fill
                                sizes="(min-width: 768px) 50vw, 100vw"
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                onError={() => setImageError(true)}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80" />
                        </>
                    ) : (
                        <ContestFallbackBanner id={contest.id} name={contest.name} />
                    )}
                </div>

                <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between gap-3">
                        <div className="space-y-3">
                            <div>
                                <h3 className="line-clamp-1 text-xl font-bold tracking-tight text-foreground/90 transition-colors group-hover:text-primary">
                                    {contest.name}
                                </h3>
                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                    <Badge
                                        variant="outline"
                                        className={`border-transparent font-semibold tracking-wide ${getContestStatusBadgeClass(String(contest.status))}`}
                                    >
                                        {formatContestLabel(String(contest.status))}
                                    </Badge>
                                    <Badge variant="secondary" className="gap-1.5">
                                        {contest.is_public ? (
                                            <ShieldCheck className="h-3.5 w-3.5" />
                                        ) : (
                                            <Lock className="h-3.5 w-3.5" />
                                        )}
                                        {contest.is_public ? "Public" : "Restricted"}
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        className={`border-transparent font-semibold tracking-wide ${getContestModeBadgeClass(String(contest.mode))}`}
                                    >
                                        {formatContestLabel(String(contest.mode))}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <AuthGuard requiredRoles={[Roles.CONTEST_DELETE]} fallbackComponent={null}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon-xs"
                                        disabled={softDeleteMutation.isPending}
                                        onClick={onSoftDelete}
                                        aria-label="Soft delete contest"
                                        title="Soft delete"
                                    >
                                        <Trash2 />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Soft delete</p>
                                </TooltipContent>
                            </Tooltip>
                        </AuthGuard>
                    </div>
                    <p className="line-clamp-2 mt-1.5 text-sm text-muted-foreground/80 leading-relaxed">
                        {contest.description ||
                            "No specific details have been provided for this contest yet."}
                    </p>
                </CardHeader>

                <CardContent className="flex-1 px-4 py-2">
                    <div className="space-y-3">
                        <div className="rounded-lg border bg-muted/20 p-3">
                            <div className="flex flex-col gap-2 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar className="h-4 w-4 text-primary" />
                                    <span className="font-medium text-foreground">Start:</span>
                                    <span className="truncate">{startDate}</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Clock3 className="h-4 w-4 text-primary" />
                                    <span className="font-medium text-foreground">End:</span>
                                    <span className="truncate">{endDate}</span>
                                </div>
                                <div className="mt-1 flex flex-wrap items-center gap-2">
                                    <Badge variant="outline" className="border-border/60">
                                        {formatContestLabel(String(contest.team_approval_mode))}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                        Created {createdAt}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Audiences
                                </p>
                                {contest.audiences?.length ? (
                                    <Badge variant="secondary" className="px-2 py-0.5 text-xs">
                                        {contest.audiences.length}
                                    </Badge>
                                ) : null}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {contest.audiences && contest.audiences.length > 0 ? (
                                    contest.audiences.map((audience) => (
                                        <Badge
                                            key={audience.id}
                                            variant="secondary"
                                            className="max-w-full gap-1.5"
                                        >
                                            <span className="truncate">{audience.name}</span>
                                            <span className="text-muted-foreground">
                                                {formatContestLabel(String(audience.audience_type))}
                                            </span>
                                        </Badge>
                                    ))
                                ) : (
                                    <Badge variant="outline">No linked audiences</Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="p-4 pt-3 border-t border-border/40">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                asChild
                                variant="default"
                                className="w-full group/btn shadow-md hover:shadow-lg transition-all"
                            >
                                <Link href={`/contest/${contest.id}`}>
                                    View Details
                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                                </Link>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Explore contest info and rules</p>
                        </TooltipContent>
                    </Tooltip>
                </CardFooter>
            </Card>
        </>
    );
}
