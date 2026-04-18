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
                    if (done) {
                        // Flush any remaining characters in the decoder's internal state
                        buffer += decoder.decode();
                        break;
                    }

                    // Accumulate decoded bytes; `stream: true` handles multi-byte characters
                    // across chunk boundaries.
                    buffer += decoder.decode(value, { stream: true });

                    // SSE events are separated by a blank line (\n\n, \r\n\r\n, or \r\r).
                    // Use a regex that covers \n\n, \r\n\r\n, \r\r, and \n\r\n.
                    const parts = buffer.split(/\r\n\r\n|\n\n|\r\r/);
                    // The last part might be an incomplete event.
                    buffer = parts.pop() ?? "";

                    for (const event of parts) {
                        if (!event.trim()) continue;

                        // Process one event. An event consists of multiple lines.
                        // Each line can be "data: ...", "event: ...", "id: ...", etc.
                        // We are interested in "data:" lines.
                        let dataPayload = "";
                        const lines = event.split(/\r\n|\r|\n/);

                        for (const line of lines) {
                            if (line.startsWith("data:")) {
                                // Join consecutive data lines with a newline as per SSE spec
                                const data = line.slice("data:".length).trim();
                                dataPayload += (dataPayload ? "\n" : "") + data;
                            }
                        }

                        if (dataPayload) {
                            try {
                                const data = JSON.parse(dataPayload);
                                if (data.type === "SESSION_OVERRIDE") {
                                    signOut({
                                        callbackUrl: "/auth/login?reason=session_override",
                                    });
                                }
                            } catch {
                                // Ignore malformed JSON payloads
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
    }, [session?.user?.id, session?.access_token, status]);
}
