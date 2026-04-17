import { useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { publicEnv } from "../public-env";

export function useSessionIntegrity() {
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === "loading") return;

        if (!session?.user?.id || !session?.access_token) {
            return;
        }

        const sseUrl = `${publicEnv.NEXT_PUBLIC_API_URL}/api/v1/sessions/stream?userId=${session.user.id}`;

        // We use a controller to close the connection on cleanup
        const ctrl = new AbortController();

        // Since standard EventSource doesn't support headers, we use a manual fetch stream
        // or a specialized library. For simplicity and correctness with your backend:
        const connectSSE = async () => {
            try {
                const response = await fetch(sseUrl, {
                    headers: {
                        Authorization: `Bearer ${session.access_token}`,
                        Accept: "text/event-stream",
                    },
                    signal: ctrl.signal,
                });

                if (response.status === 401) {
                    console.error("SSE Authentication failed (401). The token might be invalid.");
                    return;
                }

                if (!response.body) return;

                const reader = response.body.getReader();
                const decoder = new TextDecoder();

                while (true) {
                    const { value, done } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value);
                    const lines = chunk.split("\n");

                    for (const line of lines) {
                        if (line.startsWith("data:")) {
                            try {
                                const data = JSON.parse(line.replace("data:", "").trim());
                                if (data.type === "SESSION_OVERRIDE") {
                                    signOut({ callbackUrl: "/auth/login?reason=session_override" });
                                }
                            } catch {
                                // Ignore malformed JSON chunks
                            }
                        }
                    }
                }
            } catch (error: unknown) {
                if (error instanceof Error && error.name !== "AbortError") {
                    console.error("SSE Stream error:", error);
                }
            }
        };

        connectSSE();

        return () => {
            ctrl.abort();
        };
    }, [session, status]);
}
