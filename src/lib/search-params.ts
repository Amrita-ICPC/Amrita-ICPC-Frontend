export type SearchParamValue = string | string[] | undefined;

export function getSingleValue(value: SearchParamValue) {
    return Array.isArray(value) ? value[0] : value;
}

export function parsePage(value: SearchParamValue, fallback: number) {
    const parsed = Number.parseInt(getSingleValue(value) ?? "", 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function parsePageSize(value: SearchParamValue, fallback: number) {
    const parsed = Number.parseInt(getSingleValue(value) ?? "", 10);
    if (!Number.isFinite(parsed)) return fallback;
    if (parsed < 1) return 1;
    if (parsed > 100) return 100;
    return parsed;
}

export function parseBoolean(value: string | string[] | undefined) {
    const normalized = getSingleValue(value);
    if (normalized === "true") return true;
    if (normalized === "false") return false;
    return undefined;
}
