/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useQueryClient } from "@tanstack/react-query";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
    getGetContestQuestionsApiV1StudentsContestsContestIdQuestionsGetQueryKey,
    getGetQuestionSubmissionsApiV1StudentsContestsContestIdQuestionsQuestionIdSubmissionsGetQueryKey,
    getGetStudentContestStatusApiV1StudentsContestsContestIdParticipationMeGetQueryKey,
} from "@/api/generated/students/students";
import { createSSEConnection } from "@/lib/api/sse";

export type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

interface ContestSessionContextProps {
    contestId: string;
    connectionStatus: ConnectionStatus;
    activeQuestionId: string | null;
    setActiveQuestionId: (id: string | null) => void;
}

const ContestSessionContext = createContext<ContestSessionContextProps | undefined>(undefined);

export function ContestSessionProvider({
    contestId,
    children,
}: {
    contestId: string;
    children: React.ReactNode;
}) {
    const queryClient = useQueryClient();
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("connecting");
    const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);

    // Keep activeQuestionId in a ref so the SSE event listener callback always has access to the latest value without reconnecting
    const activeQuestionIdRef = useRef<string | null>(null);
    useEffect(() => {
        activeQuestionIdRef.current = activeQuestionId;
    }, [activeQuestionId]);

    useEffect(() => {
        if (!contestId) return;

        const ctrl = new AbortController();
        const sseUrl = `/api/v1/students/contests/${contestId}/submission`;

        let isDisconnected = false;
        setConnectionStatus("connecting");

        const connect = async () => {
            try {
                await createSSEConnection({
                    url: sseUrl,
                    onOpen: () => {
                        if (isDisconnected) return;
                        setConnectionStatus("connected");
                    },
                    onClose: () => {
                        if (isDisconnected) return;
                        setConnectionStatus("disconnected");
                    },
                    onMessage: (event) => {
                        if (isDisconnected) return;
                        try {
                            let parsed = JSON.parse(event.data);
                            // Handle double-encoded JSON from backend
                            if (typeof parsed === "string") {
                                parsed = JSON.parse(parsed);
                            }
                            if (parsed.type === "submission_update") {
                                const payload = parsed.payload || parsed;
                                const qId = payload.question_id || activeQuestionIdRef.current;
                                const status = payload.status;

                                if (qId) {
                                    // Invalidate submissions list query
                                    void queryClient.invalidateQueries({
                                        queryKey:
                                            getGetQuestionSubmissionsApiV1StudentsContestsContestIdQuestionsQuestionIdSubmissionsGetQueryKey(
                                                contestId,
                                                qId,
                                            ),
                                    });
                                }
                                // Also invalidate contest questions list to update solved/attempted indicators
                                void queryClient.invalidateQueries({
                                    queryKey:
                                        getGetContestQuestionsApiV1StudentsContestsContestIdQuestionsGetQueryKey(
                                            contestId,
                                        ),
                                });
                                // Also invalidate student contest status query
                                void queryClient.invalidateQueries({
                                    queryKey:
                                        getGetStudentContestStatusApiV1StudentsContestsContestIdParticipationMeGetQueryKey(
                                            contestId,
                                        ),
                                });

                                // Toast notification on terminal status
                                if (status && status !== "QUEUED" && status !== "RUNNING") {
                                    if (status === "AC") {
                                        toast.success(
                                            "Submission Accepted! All test cases passed.",
                                        );
                                    } else {
                                        const statusMessages: Record<string, string> = {
                                            WA: "Wrong Answer. Some test cases failed.",
                                            TLE: "Time Limit Exceeded.",
                                            RE: "Runtime Error occurred.",
                                            CE: "Compilation Error.",
                                            MLE: "Memory Limit Exceeded.",
                                            SYSTEM_ERROR:
                                                "System Error occurred during evaluation.",
                                        };
                                        const message =
                                            statusMessages[status] ||
                                            `Submission failed with status: ${status}`;
                                        toast.error(message);
                                    }
                                }
                            }
                        } catch {
                            // Suppress logs for heartbeat or non-JSON comments
                        }
                    },
                    onError: (err) => {
                        console.error("Submission SSE Connection error:", err);
                        setConnectionStatus("error");
                    },
                    signal: ctrl.signal,
                });
            } catch (err) {
                console.error("Failed to establish Submission SSE connection:", err);
                setConnectionStatus("error");
            }
        };

        void connect();

        return () => {
            isDisconnected = true;
            ctrl.abort();
        };
    }, [contestId, queryClient]);

    return (
        <ContestSessionContext.Provider
            value={{
                contestId,
                connectionStatus,
                activeQuestionId,
                setActiveQuestionId,
            }}
        >
            {children}
        </ContestSessionContext.Provider>
    );
}

export function useContestSession() {
    const context = useContext(ContestSessionContext);
    if (context === undefined) {
        throw new Error("useContestSession must be used within a ContestSessionProvider");
    }
    return context;
}
