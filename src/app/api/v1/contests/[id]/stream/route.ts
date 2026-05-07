import { auth } from "@/lib/auth/auth";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function buildBackendUrl(contestId: string) {
    const baseUrl = env.NEXT_PUBLIC_API_URL.replace(/\/api\/v1\/?$/, "");
    return new URL(`${baseUrl}/api/v1/contests/${contestId}/stream`);
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth();

    if (!session?.access_token) {
        return new Response("Unauthorized", { status: 401 });
    }

    // Force reconnection after 10 minutes to ensure token refresh.
    // Most OIDC tokens (like Keycloak) expire within 5-60 minutes.
    const MAX_STREAM_DURATION = 10 * 60 * 1000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), MAX_STREAM_DURATION);

    try {
        const upstreamResponse = await fetch(buildBackendUrl(id), {
            method: "GET",
            headers: {
                Accept: "text/event-stream",
                Authorization: `Bearer ${session.access_token}`,
                "Cache-Control": "no-cache",
            },
            cache: "no-store",
            signal: AbortSignal.any([request.signal, controller.signal]),
        });

        if (!upstreamResponse.ok || !upstreamResponse.body) {
            clearTimeout(timeoutId);
            return new Response(upstreamResponse.body, {
                status: upstreamResponse.status,
                statusText: upstreamResponse.statusText,
                headers: {
                    "Cache-Control": "no-cache, no-transform",
                    "Content-Type":
                        upstreamResponse.headers.get("content-type") ?? "text/plain; charset=utf-8",
                },
            });
        }

        // Create a new ReadableStream that clears the timeout when the stream is closed or cancelled
        const stream = new ReadableStream({
            async start(streamController) {
                const reader = upstreamResponse.body!.getReader();
                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        streamController.enqueue(value);
                    }
                } catch (err) {
                    streamController.error(err);
                } finally {
                    reader.releaseLock();
                    streamController.close();
                    clearTimeout(timeoutId);
                }
            },
            cancel() {
                clearTimeout(timeoutId);
                controller.abort();
            },
        });

        return new Response(stream, {
            status: 200,
            headers: {
                Connection: "keep-alive",
                "Cache-Control": "no-cache, no-transform",
                "Content-Type":
                    upstreamResponse.headers.get("content-type") ??
                    "text/event-stream; charset=utf-8",
                "X-Accel-Buffering": "no",
            },
        });
    } catch (error) {
        clearTimeout(timeoutId);
        if ((error as any).name === "AbortError") {
            // This is our intentional disconnect to force a token refresh
            return new Response("Stream connection limit reached, reconnecting...", {
                status: 200,
                headers: { "Content-Type": "text/plain" },
            });
        }
        throw error;
    }
}
