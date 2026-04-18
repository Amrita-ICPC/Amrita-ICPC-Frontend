import { useEffect } from "react";
import { signOut, useSession } from "next-auth/react";

export function useSessionIntegrity() {
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === "loading") return;

        if (!session?.user?.id || !session?.access_token) {
            return;
        }

        // Connect to the same-origin Next.js proxy route which attaches auth
        // server-side. This avoids CORS issues and keeps the bearer token out
        // of browser network tooling / URL bars.
        const sseUrl = `/api/v1/sessions/stream`;

        // We use a controller to close the connection on cleanup
        const ctrl = new AbortController();

        // Since standard EventSource doesn't support headers, we use a manual fetch stream.
        const connectSSE = async () => {
            try {
                const response = await fetch(sseUrl, {
                    headers: {
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
                let buffer = "";

                while (true) {
                    const { value, done } = await reader.read();
                    if (done) break;

                    // Accumulate decoded bytes; `stream: true` defers flushing incomplete
                    // multi-byte sequences so we don't corrupt UTF-8 boundaries.
                    buffer += decoder.decode(value, { stream: true });

                    // SSE events are delimited by a blank line ("\n\n").
                    // Split on that boundary and keep any trailing incomplete fragment.
                    const events = buffer.split("\n\n");
                    buffer = events.pop() ?? "";

                    for (const event of events) {
                        for (const line of event.split("\n")) {
                            if (line.startsWith("data:")) {
                                try {
                                    const data = JSON.parse(line.slice("data:".length).trim());
                                    if (data.type === "SESSION_OVERRIDE") {
                                        signOut({
                                            callbackUrl: "/auth/login?reason=session_override",
                                        });
                                    }
                                } catch {
                                    // Ignore malformed JSON lines
                                }
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
