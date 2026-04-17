"use client";

import { useEffect } from "react";
import { updateServerDelta } from "../store/time-store";
import { publicEnv } from "../env-public";

export function ClockSyncProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const syncTime = async () => {
            try {
                const response = await fetch(`${publicEnv.NEXT_PUBLIC_API_URL}/api/health`);
                const data = await response.json();
                // Assuming /api/health returns { timestamp: number } in ms
                if (data.timestamp) {
                    updateServerDelta(data.timestamp);
                }
            } catch (error) {
                console.error("Failed to sync clock:", error);
            }
        };

        syncTime();
        // Re-sync every 30 minutes to account for clock drift
        const interval = setInterval(syncTime, 30 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    return <>{children}</>;
}
