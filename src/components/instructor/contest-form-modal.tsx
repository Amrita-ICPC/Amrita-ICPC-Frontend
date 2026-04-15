"use client";

/**
 * Contest creation/edit modal with form
 * Supports creating new contests and editing existing ones
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateContestSchema } from "@/lib/schemas/contest";
import { useCreateContest, useUpdateContest } from "@/query/use-paginated-contests";
import { Contest } from "@/services/contests";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog } from "@/components/ui/dialog";
import { z } from "zod";

interface ContestFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    contest?: Contest | null; // If provided, edit mode; otherwise create mode
}

type FormData = z.infer<typeof CreateContestSchema>;

export function ContestFormModal({ isOpen, onClose, contest }: ContestFormModalProps) {
    const isEditMode = !!contest;
    const createContestMutation = useCreateContest();
    const updateContestMutation = useUpdateContest();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
    } = useForm<FormData>({
        resolver: zodResolver(CreateContestSchema),
        defaultValues: {
            name: contest?.name || "",
            description: contest?.description || "",
            start_time: contest?.start_time
                ? new Date(contest.start_time).toISOString().slice(0, 16)
                : "",
            end_time: contest?.end_time
                ? new Date(contest.end_time).toISOString().slice(0, 16)
                : "",
            max_teams: (contest?.max_teams as number) || 50,
        },
    });

    // Calculate duration in minutes
    const startTime = watch("start_time");
    const endTime = watch("end_time");
    const duration =
        startTime && endTime
            ? Math.floor((new Date(endTime).getTime() - new Date(startTime).getTime()) / 60000)
            : 0;

    const onSubmit = async (data: FormData) => {
        try {
            if (isEditMode && contest?.id) {
                // Parse datetime-local format to ISO string
                const payload = {
                    ...data,
                    start_time: new Date(data.start_time).toISOString(),
                    end_time: new Date(data.end_time).toISOString(),
                };
                await updateContestMutation.mutateAsync({
                    id: contest.id,
                    data: payload,
                });
            } else {
                const payload = {
                    ...data,
                    start_time: new Date(data.start_time).toISOString(),
                    end_time: new Date(data.end_time).toISOString(),
                };
                await createContestMutation.mutateAsync(payload);
            }
            reset();
            onClose();
        } catch (error) {
            // Error is handled by mutation's onError
            console.error("Form submission error:", error);
        }
    };

    const isLoading = createContestMutation.isPending || updateContestMutation.isPending;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg">
                <h2 className="text-xl font-bold mb-4">
                    {isEditMode ? "Edit Contest" : "Create New Contest"}
                </h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Contest Name */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
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
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Description
                        </label>
                        <Textarea
                            {...register("description")}
                            placeholder="Contest details and instructions"
                            className="w-full"
                            rows={3}
                        />
                        {errors.description && (
                            <p className="text-xs text-red-600 mt-1">
                                {errors.description.message}
                            </p>
                        )}
                    </div>

                    {/* Start Time */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
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
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
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
                        <div className="bg-blue-50 p-3 rounded-md">
                            <p className="text-sm text-blue-900">
                                <strong>Duration:</strong> {Math.floor(duration / 60)}h{" "}
                                {duration % 60}m
                            </p>
                        </div>
                    )}

                    {/* Max Teams */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Max Teams
                        </label>
                        <Input
                            {...register("max_teams")}
                            type="number"
                            min="1"
                            max="1000"
                            className="w-full"
                        />
                        {errors.max_teams && (
                            <p className="text-xs text-red-600 mt-1">{errors.max_teams.message}</p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading} className="flex-1">
                            {isLoading
                                ? "Saving..."
                                : isEditMode
                                  ? "Update Contest"
                                  : "Create Contest"}
                        </Button>
                    </div>
                </form>
            </div>
        </Dialog>
    );
}
