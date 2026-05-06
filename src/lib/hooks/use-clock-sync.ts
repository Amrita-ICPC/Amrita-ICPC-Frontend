"use client";

import { useStore } from "@tanstack/react-store";
import { timeStore, getServerTime } from "../store/time-store";

/**
 * Hook to get synchronized server time.
 * Returns a function to get the current server time and the delta.
 */
export function useClockSync() {
    const { serverDelta } = useStore(timeStore);

    return {
        getServerTime: () => new Date(Date.now() + serverDelta),
        serverDelta,
        rawGetServerTime: getServerTime,
    };
}
