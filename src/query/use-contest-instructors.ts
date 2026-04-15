/**
 * React Query hooks for contest instructors management
 * Provides data fetching, caching, and mutations for managing instructors on contests
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getContestInstructors,
    addContestInstructor,
    removeContestInstructor,
    type AddInstructorPayload,
} from "@/services/contests";
import { toast } from "sonner";

export const CONTEST_INSTRUCTORS_QUERY_KEY = ["contest-instructors"] as const;

/**
 * Fetch all instructors for a contest
 */
export function useContestInstructors(contestId: string | null) {
    return useQuery({
        queryKey: [...CONTEST_INSTRUCTORS_QUERY_KEY, contestId],
        queryFn: () => getContestInstructors(contestId!),
        enabled: !!contestId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

/**
 * Add instructor to contest
 */
export function useAddContestInstructor() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            contestId,
            payload,
        }: {
            contestId: string;
            payload: AddInstructorPayload;
        }) => addContestInstructor(contestId, payload),
        onSuccess: (_, variables) => {
            toast.success("Instructor added successfully");
            // Invalidate instructors list cache
            queryClient.invalidateQueries({
                queryKey: [...CONTEST_INSTRUCTORS_QUERY_KEY, variables.contestId],
            });
        },
        onError: (error: Error) => {
            toast.error(`Failed to add instructor: ${error.message}`);
        },
    });
}

/**
 * Remove instructor from contest
 */
export function useRemoveContestInstructor() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ contestId, instructorId }: { contestId: string; instructorId: string }) =>
            removeContestInstructor(contestId, instructorId),
        onSuccess: (_, variables) => {
            toast.success("Instructor removed successfully");
            // Invalidate instructors list cache
            queryClient.invalidateQueries({
                queryKey: [...CONTEST_INSTRUCTORS_QUERY_KEY, variables.contestId],
            });
        },
        onError: (error: Error) => {
            toast.error(`Failed to remove instructor: ${error.message}`);
        },
    });
}
