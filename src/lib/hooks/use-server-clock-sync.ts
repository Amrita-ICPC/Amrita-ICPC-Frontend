"use client";

/**
 * Hook to synchronize server and client clocks on app startup
 * Fetches /api/health endpoint and computes time delta
 */

import { useEffect, useRef } from "react";
import { setServerTimeDelta, computeTimeDelta } from "@/lib/clock";

interface HealthResponse {
    timestamp?: number;
    server_time?: number;
    now?: number;
    [key: string]: unknown;
}

/**
 * Hook that syncs clock on component mount
 * Should be called at app root level to initialize on startup
 */
export function useServerClockSync(): void {
    const syncedRef = useRef(false);

    useEffect(() => {
        // Only sync once per app lifecycle
        if (syncedRef.current) return;
        syncedRef.current = true;

        const syncClock = async () => {
            try {
                const clientTimeBefore = Date.now();

                // Fetch health endpoint which returns server time
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL || "http://10.10.10.23:8000"}/api/health`,
                    {
                        method: "GET",
                        // ✅ FIX: Allow cookies/sessions to be sent to the backend
                        credentials: "include",
                    },
                );

                const clientTimeAfter = Date.now();

                if (!response.ok) {
                    console.warn(
                        { status: response.status },
                        "Health check failed, skipping clock sync",
                    );
                    return;
                }

                const data = (await response.json()) as HealthResponse;

                // Extract server timestamp from various possible response fields
                const serverTimestamp = data.timestamp || data.server_time || data.now;

                if (!serverTimestamp || typeof serverTimestamp !== "number") {
                    console.warn(
                        { responseKeys: Object.keys(data) },
                        "Could not find timestamp in health response",
                    );
                    return;
                }

                // Account for network latency (use midpoint of request/response times)
                const roundTripTime = clientTimeAfter - clientTimeBefore;
                const correctedClientTime = clientTimeBefore + roundTripTime / 2;

                // Compute delta
                const delta = computeTimeDelta(serverTimestamp);
                setServerTimeDelta(delta);

                console.info(
                    {
                        delta,
                        roundTripTime,
                        serverTimestamp,
                        correctedClientTime,
                    },
                    "Clock synchronized with server",
                );
            } catch (error) {
                console.error("Failed to sync server clock:", error);
                // Don't crash - continue with local time
            }
        };

        syncClock();
    }, []);
}

/**
 * Alternative version that syncs on demand
 * Useful for explicit sync operations
 */
export async function syncServerClockOnDemand(): Promise<number | null> {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://10.10.10.23:8000"}/api/health`,
            {
                method: "GET",
                // ✅ FIX: Allow cookies/sessions to be sent to the backend
                credentials: "include",
            },
        );

        if (!response.ok) {
            console.warn({ status: response.status }, "Health check failed");
            return null;
        }

        const data = (await response.json()) as HealthResponse;
        const serverTimestamp = data.timestamp || data.server_time || data.now;

        if (!serverTimestamp || typeof serverTimestamp !== "number") {
            console.warn("Could not find timestamp in health response");
            return null;
        }

        const delta = computeTimeDelta(serverTimestamp);
        setServerTimeDelta(delta);

        console.info("Clock re-synced on demand", { delta, serverTimestamp });
        return delta;
    } catch (error) {
        console.error("Failed to re-sync server clock:", error);
        return null;
    }
}
