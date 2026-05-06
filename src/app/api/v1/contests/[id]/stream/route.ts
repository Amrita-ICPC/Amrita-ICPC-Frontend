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

    const upstreamResponse = await fetch(buildBackendUrl(id), {
        method: "GET",
        headers: {
            Accept: "text/event-stream",
            Authorization: `Bearer ${session.access_token}`,
            "Cache-Control": "no-cache",
        },
        cache: "no-store",
    });

    if (!upstreamResponse.ok || !upstreamResponse.body) {
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

    return new Response(upstreamResponse.body, {
        status: 200,
        headers: {
            Connection: "keep-alive",
            "Cache-Control": "no-cache, no-transform",
            "Content-Type":
                upstreamResponse.headers.get("content-type") ?? "text/event-stream; charset=utf-8",
            "X-Accel-Buffering": "no",
        },
    });
}
