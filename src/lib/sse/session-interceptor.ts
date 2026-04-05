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
        let reconnectTimeoutId: NodeJS.Timeout | null = null;
        let disposed = false;

        const connect = () => {
            if (disposed) return;
            if (eventSource) eventSource.close();
            
            eventSource = new EventSource(sseEndpointUrl, { withCredentials: true });

            eventSource.addEventListener("SESSION_OVERRIDE", () => {
                if (disposed) return;
                console.warn("[Session Integrity] Concurrent login detected. Purging session...");
                localStorage.clear();
                sessionStorage.clear();
                signOut({ callbackUrl: "/auth/login?error=SessionOverride" });
            });

            eventSource.onerror = () => {
                if (disposed) return;
                console.error("[Session Interceptor] SSE connection lost. Attempting reconnect in 5s...");
                eventSource?.close();
                // Clear any existing timeout before setting a new one
                if (reconnectTimeoutId) clearTimeout(reconnectTimeoutId);
                reconnectTimeoutId = setTimeout(connect, 5000);
            };
        };

        connect();

        return () => {
            disposed = true;
            if (eventSource) {
                eventSource.close();
            }
            if (reconnectTimeoutId) {
                clearTimeout(reconnectTimeoutId);
            }
        };
    }, [sseEndpointUrl]);
}
