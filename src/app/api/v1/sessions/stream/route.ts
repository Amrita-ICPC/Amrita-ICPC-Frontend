import { auth } from "@/lib/auth/auth";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function buildBackendUrl(userId: string) {
    const baseUrl = env.NEXT_PUBLIC_API_URL.replace(/\/api\/v1\/?$/, "");
    const url = new URL(`${baseUrl}/api/v1/sessions/stream`);
    url.searchParams.set("userId", userId);
    return url;
}

export async function GET() {
    const session = await auth();

    if (!session?.user?.id || !session.access_token) {
        return new Response("Unauthorized", { status: 401 });
    }

    const upstreamResponse = await fetch(buildBackendUrl(session.user.id), {
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
