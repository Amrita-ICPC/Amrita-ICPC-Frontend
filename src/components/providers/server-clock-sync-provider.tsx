"use client";

/**
 * Server Clock Sync Provider
 * Initializes server-client time synchronization on app startup
 */

import { ReactNode } from "react";
import { useServerClockSync } from "@/lib/hooks/use-server-clock-sync";

export function ServerClockSyncProvider({ children }: { children: ReactNode }) {
    // This hook runs on mount and syncs the clock once
    useServerClockSync();

    return <>{children}</>;
}
