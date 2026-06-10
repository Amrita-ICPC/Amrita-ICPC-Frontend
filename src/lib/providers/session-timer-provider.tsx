import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

import type { ContestTeamProgressResponse } from "@/api/generated/model";
import {
    getGetRuntimeSessionApiV1StudentsContestsContestIdRuntimeGetQueryKey,
    getGetStudentContestByIdApiV1StudentsContestsContestIdGetQueryKey,
    getGetStudentContestStatusApiV1StudentsContestsContestIdParticipationMeGetQueryKey,
    useGetRuntimeSessionApiV1StudentsContestsContestIdRuntimeGet,
} from "@/api/generated/students/students";

interface SessionTimerContextProps {
    timeLeft: string;
    runtimeSession: ContestTeamProgressResponse | null | undefined;
    isTimerLoading: boolean;
}

const SessionTimerContext = createContext<SessionTimerContextProps | undefined>(undefined);

export function SessionTimerProvider({
    contestId,
    children,
}: {
    contestId: string;
    children: React.ReactNode;
}) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [timeLeft, setTimeLeft] = useState<string>("00:00:00");
    const { data: runtimeRes, isLoading: isTimerLoading } =
        useGetRuntimeSessionApiV1StudentsContestsContestIdRuntimeGet(contestId);
    const runtimeSession = runtimeRes?.data;
    const effectiveEndTime = runtimeSession?.runtime?.effective_end_time || null;

    useEffect(() => {
        if (!effectiveEndTime) return;

        const updateTimer = () => {
            const now = new Date().getTime();
            const target = new Date(effectiveEndTime).getTime();
            const diff = target - now;

            if (diff <= 0) {
                setTimeLeft("00:00:00");
                clearInterval(interval);
                toast.info("The contest session has ended.");
                // Invalidate queries in parallel to ensure details page gets fresh status
                void queryClient.invalidateQueries({
                    queryKey:
                        getGetStudentContestByIdApiV1StudentsContestsContestIdGetQueryKey(
                            contestId,
                        ),
                });
                void queryClient.invalidateQueries({
                    queryKey:
                        getGetStudentContestStatusApiV1StudentsContestsContestIdParticipationMeGetQueryKey(
                            contestId,
                        ),
                });
                void queryClient.invalidateQueries({
                    queryKey:
                        getGetRuntimeSessionApiV1StudentsContestsContestIdRuntimeGetQueryKey(
                            contestId,
                        ),
                });
                router.push(`/student/contest/${contestId}`);
                return;
            }

            const h = Math.floor(diff / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft(
                `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`,
            );
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [effectiveEndTime, contestId, router, queryClient]);

    return (
        <SessionTimerContext.Provider value={{ timeLeft, runtimeSession, isTimerLoading }}>
            {children}
        </SessionTimerContext.Provider>
    );
}

export function useSessionTimer() {
    const context = useContext(SessionTimerContext);
    if (context === undefined) {
        throw new Error("useSessionTimer must be used within a SessionTimerProvider");
    }
    return context;
}
