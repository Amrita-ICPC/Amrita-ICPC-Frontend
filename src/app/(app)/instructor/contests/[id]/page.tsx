"use client";

/**
 * Contest detail/settings page
 * Displays full contest information for instructors
 * Instructor-only role protection
 */

import { useRouter, useParams } from "next/navigation";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useContest } from "@/query/use-paginated-contests";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ArrowLeft, Edit, Trash2, Share2, RotateCcw, CheckCircle } from "lucide-react";
import { format } from "date-fns";

function ContestDetailContent() {
    const router = useRouter();
    const params = useParams();
    const contestId = params?.id as string;

    const { data: contest, isLoading, error } = useContest(contestId);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-1/3" />
                <Card className="p-6 space-y-4">
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-6 w-2/5" />
                    <Skeleton className="h-6 w-1/3" />
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    Failed to load contest details. Please try again.
                </AlertDescription>
            </Alert>
        );
    }

    if (!contest) {
        return (
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Contest not found.</AlertDescription>
            </Alert>
        );
    }

    const startDate = new Date(contest.start_time);
    const endDate = new Date(contest.end_time);
    const now = new Date();
    const hasStarted = now >= startDate;
    const hasEnded = now >= endDate;

    // Determine contest status
    type StatusType = "draft" | "scheduled" | "running" | "ended";
    let status: StatusType = "draft";
    if (!hasStarted) status = "scheduled";
    else if (!hasEnded) status = "running";
    else status = "ended";

    const statusVariant = {
        draft: "secondary" as const,
        scheduled: "outline" as const,
        running: "default" as const,
        ended: "outline" as const,
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Button>
            </div>

            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold">{contest.name}</h1>
                    <p className="text-gray-600 mt-2">{contest.description || "No description"}</p>
                </div>
                <Badge variant={statusVariant[status]}>{status.toUpperCase()}</Badge>
            </div>

            {/* Main Details Card */}
            <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">Contest Information</h2>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* Start Time */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                Start Time
                            </label>
                            <p className="text-lg font-mono">
                                {format(startDate, "MMM dd, yyyy HH:mm:ss 'IST'")}
                            </p>
                        </div>

                        {/* End Time */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                End Time
                            </label>
                            <p className="text-lg font-mono">
                                {format(endDate, "MMM dd, yyyy HH:mm:ss 'IST'")}
                            </p>
                        </div>

                        {/* Duration */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                Duration
                            </label>
                            <p className="text-lg">
                                {Math.floor((endDate.getTime() - startDate.getTime()) / 60000)}{" "}
                                minutes
                            </p>
                        </div>

                        {/* Visibility */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                Visibility
                            </label>
                            <Badge variant={contest.is_public ? "default" : "secondary"}>
                                {contest.is_public ? "PUBLIC" : "PRIVATE"}
                            </Badge>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Max Teams */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                Max Teams
                            </label>
                            <p className="text-lg">{contest.max_teams || "Unlimited"}</p>
                        </div>

                        {/* Min Team Size */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                Min Team Size
                            </label>
                            <p className="text-lg">{contest.min_team_size || 1}</p>
                        </div>

                        {/* Max Team Size */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                Max Team Size
                            </label>
                            <p className="text-lg">{contest.max_team_size || 1}</p>
                        </div>

                        {/* Scoring Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                Scoring Type
                            </label>
                            <Badge variant="outline">{contest.scoring_type || "AUTO"}</Badge>
                        </div>
                    </div>
                </div>

                {/* Rules */}
                {contest.rules && (
                    <div className="mt-8 pt-8 border-t">
                        <h3 className="text-lg font-semibold mb-4">Rules</h3>
                        <p className="text-gray-700 whitespace-pre-wrap">{contest.rules}</p>
                    </div>
                )}

                {/* Registration Period */}
                {(contest.registration_start || contest.registration_end) && (
                    <div className="mt-8 pt-8 border-t">
                        <h3 className="text-lg font-semibold mb-4">Registration Period</h3>
                        <div className="space-y-3">
                            {contest.registration_start && (
                                <div>
                                    <p className="text-sm text-gray-600">Starts</p>
                                    <p className="font-mono">
                                        {format(
                                            new Date(contest.registration_start),
                                            "MMM dd, yyyy HH:mm:ss",
                                        )}
                                    </p>
                                </div>
                            )}
                            {contest.registration_end && (
                                <div>
                                    <p className="text-sm text-gray-600">Ends</p>
                                    <p className="font-mono">
                                        {format(
                                            new Date(contest.registration_end),
                                            "MMM dd, yyyy HH:mm:ss",
                                        )}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Team Approval Mode */}
                <div className="mt-8 pt-8 border-t">
                    <h3 className="text-lg font-semibold mb-4">Team Approval Mode</h3>
                    <Badge variant="outline">{contest.team_approval_mode || "AUTO_APPROVE"}</Badge>
                </div>
            </Card>

            {/* Action Buttons */}
            <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Actions</h2>
                <div className="flex flex-wrap gap-3">
                    <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => router.push(`/instructor/contests/${contestId}/edit`)}
                    >
                        <Edit className="w-4 h-4" />
                        Edit Contest
                    </Button>

                    {!hasStarted && (
                        <Button
                            className="gap-2"
                            onClick={() => {
                                /* TODO: Implement publish action */
                            }}
                        >
                            <CheckCircle className="w-4 h-4" />
                            Publish Contest
                        </Button>
                    )}

                    <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => {
                            /* TODO: Implement manage instructors */
                        }}
                    >
                        <Share2 className="w-4 h-4" />
                        Manage Instructors
                    </Button>

                    {!hasEnded && (
                        <Button
                            variant="destructive"
                            className="gap-2"
                            onClick={() => {
                                /* TODO: Implement delete/soft-delete */
                            }}
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete Contest
                        </Button>
                    )}

                    {!hasEnded && (
                        <Button
                            variant="outline"
                            className="gap-2"
                            onClick={() => {
                                /* TODO: Implement restore if soft-deleted */
                            }}
                        >
                            <RotateCcw className="w-4 h-4" />
                            Restore
                        </Button>
                    )}
                </div>
            </Card>
        </div>
    );
}

export default function ContestDetailPage() {
    return (
        <AuthGuard requiredRoles={["instructor", "admin"]} redirectTo="/dashboard">
            <ContestDetailContent />
        </AuthGuard>
    );
}
