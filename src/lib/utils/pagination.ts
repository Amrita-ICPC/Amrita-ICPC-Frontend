/**
 * Helper to ensure a parsed page parameter is a valid integer >= 1
 */
export function clampPage(value: number) {
    if (!Number.isFinite(value) || value < 1) return 1;
    return Math.floor(value);
}

/**
 * Helper to ensure a parsed page size parameter is a valid integer between 1 and 100
 */
export function clampPageSize(value: number) {
    if (!Number.isFinite(value)) return 10;
    if (value < 1) return 1;
    if (value > 100) return 100;
    return Math.floor(value);
}
