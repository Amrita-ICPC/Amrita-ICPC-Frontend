"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";

interface UseSessionInterceptorProps {
    sseEndpointUrl: string;
}

/**
 * Session Integrity Monitor (Hook)
 * 
 * Uses Server-Sent Events (SSE) to listen for session overrides from the backend.
 * If a concurrent login is detected, it clears all local storage and forces a sign out.
 */
export function useSessionInterceptor({ sseEndpointUrl }: UseSessionInterceptorProps) {
    useEffect(() => {
        let eventSource: EventSource | null = null;

        const connect = () => {
            eventSource = new EventSource(sseEndpointUrl, { withCredentials: true });

            eventSource.addEventListener("SESSION_OVERRIDE", () => {
                console.warn("[Session Integrity] Concurrent login detected. Purging session...");
                localStorage.clear();
                sessionStorage.clear();
                signOut({ callbackUrl: "/auth/login?error=SessionOverride" });
            });

            eventSource.onerror = (err) => {
                console.error("[Session Interceptor] SSE connection lost. Attempting reconnect...");
                eventSource?.close();
                setTimeout(connect, 5000);
            };
        };

        connect();

        return () => {
            if (eventSource) {
                eventSource.close();
            }
        };
    }, [sseEndpointUrl]);
}
