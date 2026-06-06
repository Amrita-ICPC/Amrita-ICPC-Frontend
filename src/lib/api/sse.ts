// lib/api/sse.ts
"use client";

import { EventSourceMessage, fetchEventSource } from "@microsoft/fetch-event-source";
import { getSession } from "next-auth/react";

import { env } from "@/lib/env";

type SSEOptions = {
    url: string;
    onMessage: (event: EventSourceMessage) => void;
    onOpen?: (response: Response) => void;
    onClose?: () => void;
    onError?: (error: unknown) => number | void;
    signal?: AbortSignal;
};

const getBaseUrl = (url: string) => {
    return url.replace(/\/api\/v1\/?$/, "");
};

export async function createSSEConnection({
    url,
    onMessage,
    onOpen,
    onClose,
    onError,
    signal,
}: SSEOptions) {
    const session = await getSession();
    const accessToken = session?.access_token;

    await fetchEventSource(getBaseUrl(env.NEXT_PUBLIC_API_URL as string) + url, {
        signal,
        openWhenHidden: true,
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },

        async onopen(response) {
            if (!response.ok) {
                throw new Error(`SSE failed: ${response.status}`);
            }
            onOpen?.(response);
        },

        onmessage(event: EventSourceMessage) {
            onMessage(event);
        },

        onclose() {
            onClose?.();
        },

        onerror(err) {
            const retryTime = onError?.(err);
            return retryTime ?? 5000;
        },
    });
}
