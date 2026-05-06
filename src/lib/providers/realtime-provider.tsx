"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface RealtimeContextType {
    isConnected: boolean;
    lastEvent: any | null;
    subscribe: (contestId: string) => void;
    unsubscribe: () => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export function RealtimeProvider({ children }: { children: ReactNode }) {
    const { data: session } = useSession();
    const [contestId, setContestId] = useState<string | null>(null);
    const [isConnected, setConnected] = useState(false);
    const [lastEvent, setLastEvent] = useState<any | null>(null);

    const handleGlobalEvent = useCallback((event: any) => {
        switch (event.type) {
            case "SUBMISSION_RESULT":
                toast.info(`Submission for ${event.problem_name}: ${event.status}`, {
                    description: event.passed ? "Accepted!" : "Failed test cases.",
                });
                break;
            case "ANNOUNCEMENT":
                toast.warning("Contest Announcement", {
                    description: event.message,
                });
                break;
        }
    }, []);

    useEffect(() => {
        if (!contestId || !session?.access_token) {
            return;
        }

        const sseUrl = `/api/v1/contests/${contestId}/stream`;
        const ctrl = new AbortController();

        const connect = async () => {
            try {
                const response = await fetch(sseUrl, {
                    headers: { Accept: "text/event-stream" },
                    signal: ctrl.signal,
                });

                if (!response.ok) {
                    throw new Error(`SSE Connection failed: ${response.status}`);
                }

                setConnected(true);
                const reader = response.body?.getReader();
                if (!reader) return;

                const decoder = new TextDecoder();
                let buffer = "";

                while (true) {
                    const { value, done } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const parts = buffer.split(/\r\n\r\n|\n\n|\r\r/);
                    buffer = parts.pop() ?? "";

                    for (const part of parts) {
                        if (!part.trim()) continue;

                        let dataPayload = "";
                        const lines = part.split(/\r\n|\r|\n/);
                        for (const line of lines) {
                            if (line.startsWith("data:")) {
                                dataPayload += line.slice(5).trim();
                            }
                        }

                        if (dataPayload) {
                            try {
                                const event = JSON.parse(dataPayload);
                                setLastEvent(event);
                                handleGlobalEvent(event);
                            } catch (e) {
                                console.error("Failed to parse SSE data", e);
                            }
                        }
                    }
                }
            } catch (err: any) {
                if (err.name !== "AbortError") {
                    console.error("Realtime connection error:", err);
                    setConnected(false);
                    // Attempt retry after delay
                    setTimeout(connect, 5000);
                }
            }
        };

        connect();

        return () => {
            ctrl.abort();
            setConnected(false);
        };
    }, [contestId, session?.access_token, handleGlobalEvent]);

    return (
        <RealtimeContext.Provider
            value={{
                isConnected,
                lastEvent,
                subscribe: setContestId,
                unsubscribe: () => setContestId(null),
            }}
        >
            {children}
        </RealtimeContext.Provider>
    );
}

export const useRealtime = () => {
    const context = useContext(RealtimeContext);
    if (!context) throw new Error("useRealtime must be used within RealtimeProvider");
    return context;
};
