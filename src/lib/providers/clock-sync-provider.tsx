"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { logger } from "../logger";

interface ClockSyncContextType {
    offset: number;
    syncedNow: () => number;
    isSynced: boolean;
}

const ClockSyncContext = createContext<ClockSyncContextType>({
    offset: 0,
    syncedNow: () => Date.now(),
    isSynced: false,
});

/**
 * ClockSyncProvider synchronizes the client clock with the server clock.
 * This is crucial for accurate token expiration checks and time-sensitive UI.
 */
export function ClockSyncProvider({ children }: { children: React.ReactNode }) {
    const [offset, setOffset] = useState(0);
    const [isSynced, setIsSynced] = useState(false);

    const syncTime = useCallback(async () => {
        try {
            const start = Date.now();
            // Use Next-Auth session endpoint as it's guaranteed to exist and is lightweight for HEAD requests
            const response = await fetch("/api/auth/session", { 
                method: "HEAD",
                cache: "no-store", // Ensure we get fresh headers
            });
            const end = Date.now();
            
            const serverDateStr = response.headers.get("Date");
            
            if (serverDateStr) {
                const serverTime = new Date(serverDateStr).getTime();
                
                // Adjust for network latency (RTT)
                // We assume server processing time is negligible compared to network latency
                const rtt = end - start;
                const estimatedServerTimeAtEnd = serverTime + (rtt / 2);
                
                const newOffset = estimatedServerTimeAtEnd - end;
                setOffset(newOffset);
                setIsSynced(true);
                
                logger.info(`Clock synchronized. Server offset: ${newOffset}ms (RTT: ${rtt}ms)`);
            } else {
                logger.warn("Could not find Date header in server response for clock sync");
            }
        } catch (error) {
            logger.error("Failed to synchronize clock with server", { error });
        }
    }, []);

    useEffect(() => {
        syncTime();
        
        // Re-sync every 30 minutes to account for clock drift
        const interval = setInterval(syncTime, 30 * 60 * 1000);
        return () => clearInterval(interval);
    }, [syncTime]);

    const syncedNow = useCallback(() => Date.now() + offset, [offset]);

    const value = React.useMemo(() => ({
        offset,
        syncedNow,
        isSynced
    }), [offset, syncedNow, isSynced]);

    return (
        <ClockSyncContext.Provider value={value}>
            {children}
        </ClockSyncContext.Provider>
    );
}

/**
 * Hook to access clock synchronization state and functions.
 */
export const useClockSync = () => useContext(ClockSyncContext);
