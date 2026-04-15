/**
 * Server clock synchronization utilities
 * Computes time delta between server and client for accurate contest timing
 */

// Global state for server-client time delta (in milliseconds)
let serverTimeDelta = 0;

/**
 * Set the time delta computed from server
 * Should only be called once on app startup
 */
export function setServerTimeDelta(delta: number): void {
    serverTimeDelta = delta;
    console.debug(`[Clock Sync] Server time delta: ${delta}ms (${(delta / 1000).toFixed(2)}s)`);
}

/**
 * Get the current time delta
 */
export function getServerTimeDelta(): number {
    return serverTimeDelta;
}

/**
 * Get accurate server time by applying delta to client time
 * Always use this instead of Date.now() for contest timing
 */
export function getServerTime(): Date {
    const clientNow = Date.now();
    const serverNow = clientNow + serverTimeDelta;
    return new Date(serverNow);
}

/**
 * Get accurate server timestamp in milliseconds
 */
export function getServerTimestamp(): number {
    return Date.now() + serverTimeDelta;
}

/**
 * Compute time delta from server response
 * Call this with a timestamp from the server's /api/health endpoint
 *
 * @param serverTimestamp - Timestamp from server (should be Date.now() equivalent)
 * @returns Delta in milliseconds (positive = server ahead, negative = client ahead)
 */
export function computeTimeDelta(serverTimestamp: number): number {
    const clientNow = Date.now();
    return serverTimestamp - clientNow;
}

/**
 * Get remaining time until a deadline
 * Returns milliseconds remaining, or negative if deadline has passed
 */
export function getRemainingTime(deadline: Date | number): number {
    const deadlineMs = typeof deadline === "number" ? deadline : deadline.getTime();
    const serverNow = getServerTimestamp();
    return deadlineMs - serverNow;
}

/**
 * Check if a deadline has passed (accounting for server time)
 */
export function isDeadlinePassed(deadline: Date | number): boolean {
    return getRemainingTime(deadline) < 0;
}

/**
 * Get a human-readable time remaining string
 * e.g., "1h 23m 45s" or "45s" or "0s"
 */
export function formatTimeRemaining(ms: number): string {
    if (ms < 0) return "Expired";

    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
        return `${days}d ${hours % 24}h ${minutes % 60}m`;
    }
    if (hours > 0) {
        return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    }
    if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
}
