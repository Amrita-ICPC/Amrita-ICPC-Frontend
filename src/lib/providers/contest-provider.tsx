/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createSSEConnection } from "@/lib/api/sse";
import {
    useGetStudentContestByIdApiV1StudentsContestsContestIdGet,
    useGetStudentContestStatusApiV1StudentsContestsContestIdParticipationMeGet,
    getGetStudentContestByIdApiV1StudentsContestsContestIdGetQueryKey,
    getGetStudentContestStatusApiV1StudentsContestsContestIdParticipationMeGetQueryKey,
    getGetRuntimeSessionApiV1StudentsContestsContestIdRuntimeGetQueryKey,
} from "@/api/generated/students/students";
import { StudentContestDetailsResponse, StudentContestStatusResponse } from "@/api/generated/model";

interface ContestContextType {
    contest: StudentContestDetailsResponse | null | undefined;
    participation: StudentContestStatusResponse | null | undefined;
    isLoading: boolean;
    isContestLoading: boolean;
    isStatusLoading: boolean;
    isError: boolean;
    error: any;
    refetchContest: () => void;
    refetchStatus: () => void;
    isPaused: boolean;
    isRunning: boolean;
    isCancelled: boolean;
    isFinished: boolean;
}

const ContestContext = createContext<ContestContextType | undefined>(undefined);

export function ContestProvider({
    contestId,
    children,
}: {
    contestId: string;
    children: React.ReactNode;
}) {
    const queryClient = useQueryClient();
    const controllerRef = useRef<AbortController | null>(null);

    // Core React-Query Calls
    const {
        data: contestRes,
        isLoading: isContestLoading,
        isError: isContestError,
        error: contestError,
        refetch: refetchContest,
    } = useGetStudentContestByIdApiV1StudentsContestsContestIdGet(contestId);

    const {
        data: statusRes,
        isLoading: isStatusLoading,
        isError: isStatusError,
        error: statusError,
        refetch: refetchStatus,
    } = useGetStudentContestStatusApiV1StudentsContestsContestIdParticipationMeGet(contestId);

    // Local mutable state driven by API + SSE updates
    const [contest, setContest] = useState<StudentContestDetailsResponse | null | undefined>(
        undefined,
    );
    const [participation, setParticipation] = useState<
        StudentContestStatusResponse | null | undefined
    >(undefined);

    const [isPaused, setIsPaused] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [isCancelled, setIsCancelled] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    // Sync state when initial query fetches resolve
    useEffect(() => {
        if (contestRes?.data) {
            setContest(contestRes.data);
        }
    }, [contestRes]);

    useEffect(() => {
        if (statusRes?.data) {
            setParticipation(statusRes.data);
        }
    }, [statusRes]);

    // Handle SSE connections
    useEffect(() => {
        setIsPaused(false);
        setIsRunning(false);
        setIsCancelled(false);
        setIsFinished(false);

        if (controllerRef.current) {
            controllerRef.current.abort();
            controllerRef.current = null;
        }

        const controller = new AbortController();
        controllerRef.current = controller;

        const connect = async () => {
            await createSSEConnection({
                url: `/api/v1/students/contests/${contestId}/events`,
                signal: controller.signal,
                onMessage(event) {
                    try {
                        const payload = JSON.parse(event.data) as {
                            type?: string;
                            status?: string;
                        };
                        const status = (payload.type ?? payload.status ?? "").toUpperCase();

                        if (status === "PAUSED") {
                            setIsPaused(true);
                            setIsRunning(false);
                            setIsCancelled(false);
                            setIsFinished(false);

                            setContest((prev) =>
                                prev ? { ...prev, status: "PAUSED" as any } : prev,
                            );
                            setParticipation((prev) => {
                                if (!prev) return prev;
                                return {
                                    ...prev,
                                    session: {
                                        ...prev.session,
                                        can_start: false,
                                        contest_runtime_status: "PAUSED",
                                        reason: "The contest has been paused by the admin.",
                                    },
                                };
                            });
                        } else if (status === "RESUMED" || status === "RUNNING") {
                            setIsRunning(true);
                            setIsPaused(false);
                            setIsCancelled(false);
                            setIsFinished(false);

                            setContest((prev) =>
                                prev
                                    ? { ...prev, status: "PUBLISHED" as any, run_status: "LIVE" }
                                    : prev,
                            );
                            setParticipation((prev) => {
                                if (!prev) return prev;
                                const isApproved = prev.registration_status?.status === "APPROVED";
                                return {
                                    ...prev,
                                    session: {
                                        ...prev.session,
                                        can_start: isApproved,
                                        contest_runtime_status: "RUNNING",
                                        reason: isApproved ? null : "Registration is not approved.",
                                    },
                                };
                            });
                        } else if (status === "CANCELLED") {
                            setIsCancelled(true);
                            setIsRunning(false);
                            setIsPaused(false);
                            setIsFinished(false);

                            setContest((prev) =>
                                prev ? { ...prev, status: "CANCELLED" as any } : prev,
                            );
                            setParticipation((prev) => {
                                if (!prev) return prev;
                                return {
                                    ...prev,
                                    session: {
                                        ...prev.session,
                                        can_start: false,
                                        contest_runtime_status: "CANCELLED",
                                        reason: "The contest has been cancelled.",
                                    },
                                };
                            });
                        } else if (status === "FINISHED") {
                            setIsFinished(true);
                            setIsRunning(false);
                            setIsPaused(false);
                            setIsCancelled(false);

                            setContest((prev) => (prev ? { ...prev, run_status: "ENDED" } : prev));
                            setParticipation((prev) => {
                                if (!prev) return prev;
                                return {
                                    ...prev,
                                    session: {
                                        ...prev.session,
                                        can_start: false,
                                        contest_runtime_status: "FINISHED",
                                        reason: "The contest has ended.",
                                    },
                                };
                            });
                        }

                        // Also invalidate react-query caches in parallel
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
                    } catch {
                        // ignore non-JSON frames
                    }
                },
            });
        };

        void connect();

        return () => {
            controller.abort();
            controllerRef.current = null;
        };
    }, [contestId, queryClient]);

    const isLoading = isContestLoading || isStatusLoading;
    const isError = isContestError || isStatusError;
    const error = contestError || statusError;

    return (
        <ContestContext.Provider
            value={{
                contest,
                participation,
                isLoading,
                isContestLoading,
                isStatusLoading,
                isError,
                error,
                refetchContest,
                refetchStatus,
                isPaused,
                isRunning,
                isCancelled,
                isFinished,
            }}
        >
            {children}
        </ContestContext.Provider>
    );
}

export function useContest() {
    const context = useContext(ContestContext);
    if (context === undefined) {
        throw new Error("useContest must be used within a ContestProvider");
    }
    return context;
}
