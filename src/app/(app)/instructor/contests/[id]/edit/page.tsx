"use client";

/**
 * Contest edit page
 * Full page form for editing contest details
 * Instructor-only role protection
 */

import React, { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useContest, useUpdateContest } from "@/query/use-paginated-contests";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ArrowLeft, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpdateContestSchema } from "@/lib/schemas/contest";
import { z } from "zod";
import { toast } from "sonner";

type FormData = z.infer<typeof UpdateContestSchema>;

function ContestEditContent() {
    const router = useRouter();
    const params = useParams();
    const contestId = params?.id as string;

    const { data: contest, isLoading } = useContest(contestId);
    const updateMutation = useUpdateContest();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        watch,
        reset,
    } = useForm<FormData>({
        resolver: zodResolver(UpdateContestSchema),
        defaultValues: {
            name: "",
            description: "",
            start_time: "",
            end_time: "",
            max_teams: undefined,
        },
    });

    // Update form once contest data loads
    useEffect(() => {
        if (contest) {
            reset({
                name: contest.name,
                description: contest.description,
                start_time: contest.start_time
                    ? new Date(contest.start_time).toISOString().slice(0, 16)
                    : "",
                end_time: contest.end_time
                    ? new Date(contest.end_time).toISOString().slice(0, 16)
                    : "",
                max_teams: contest.max_teams,
            });
        }
    }, [contest, reset]);

    // Calculate duration
    // eslint-disable-next-line react-hooks/incompatible-library
    const startTime = watch("start_time");

    const endTime = watch("end_time");
    const duration =
        startTime && endTime
            ? Math.floor((new Date(endTime).getTime() - new Date(startTime).getTime()) / 60000)
            : 0;

    const onSubmit = async (data: FormData) => {
        try {
            const payload = {
                ...data,
                start_time: data.start_time ? new Date(data.start_time).toISOString() : undefined,
                end_time: data.end_time ? new Date(data.end_time).toISOString() : undefined,
            };

            await updateMutation.mutateAsync({
                id: contestId,
                data: payload,
            });

            toast.success("Contest updated successfully");
            router.push(`/instructor/contests/${contestId}`);
        } catch {
            toast.error("Failed to update contest");
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-1/3" />
                <Card className="p-6 space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </Card>
            </div>
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Button>
            </div>

            <div>
                <h1 className="text-3xl font-bold">Edit Contest</h1>
                <p className="text-gray-600 mt-1">{contest.name}</p>
            </div>

            {/* Edit Form */}
            <Card className="p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Contest Name */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Contest Name *
                        </label>
                        <Input
                            {...register("name")}
                            placeholder="e.g., ICPC Online Round 1"
                            className="w-full"
                        />
                        {errors.name && (
                            <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Description
                        </label>
                        <Textarea
                            {...register("description")}
                            placeholder="Contest details and instructions"
                            rows={4}
                            className="w-full"
                        />
                        {errors.description && (
                            <p className="text-xs text-red-600 mt-1">
                                {errors.description.message}
                            </p>
                        )}
                    </div>

                    {/* Start Time */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Start Time *
                        </label>
                        <input
                            {...register("start_time")}
                            type="datetime-local"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.start_time && (
                            <p className="text-xs text-red-600 mt-1">{errors.start_time.message}</p>
                        )}
                    </div>

                    {/* End Time */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            End Time *
                        </label>
                        <input
                            {...register("end_time")}
                            type="datetime-local"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.end_time && (
                            <p className="text-xs text-red-600 mt-1">{errors.end_time.message}</p>
                        )}
                    </div>

                    {/* Duration Display */}
                    {duration > 0 && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                            <p className="text-sm text-blue-800 font-medium">
                                Duration: {duration} minutes ({Math.floor(duration / 60)} hours)
                            </p>
                        </div>
                    )}

                    {/* Max Teams */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Maximum Teams
                        </label>
                        <Input
                            {...register("max_teams", { valueAsNumber: true })}
                            type="number"
                            placeholder="Leave empty for unlimited"
                            min="1"
                            max="1000"
                            className="w-full"
                        />
                        {errors.max_teams && (
                            <p className="text-xs text-red-600 mt-1">{errors.max_teams.message}</p>
                        )}
                    </div>

                    {/* Form Actions */}
                    <div className="flex gap-3 pt-6 border-t">
                        <Button
                            type="submit"
                            disabled={isSubmitting || updateMutation.isPending}
                            className="gap-2"
                        >
                            <Save className="w-4 h-4" />
                            {isSubmitting || updateMutation.isPending
                                ? "Saving..."
                                : "Save Changes"}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            disabled={isSubmitting || updateMutation.isPending}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}

export default function ContestEditPage() {
    return (
        <AuthGuard requiredRoles={["instructor", "admin"]} redirectTo="/dashboard">
            <ContestEditContent />
        </AuthGuard>
    );
}
