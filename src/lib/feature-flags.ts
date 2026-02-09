const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);

function normalizeFlagName(name: string) {
    return name
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9_]/g, "_");
}

function parseFlagList(value?: string) {
    return new Set(
        (value ?? "")
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
    );
}

function isTrue(value?: string) {
    if (!value) return false;
    return TRUE_VALUES.has(value.toLowerCase());
}

export function isFeatureEnabled(name: string) {
    const normalized = normalizeFlagName(name);
    const direct = process.env[`FEATURE_${normalized}`];
    if (direct !== undefined) {
        return isTrue(direct);
    }
    const list = parseFlagList(process.env.FEATURE_FLAGS);
    return list.has(name);
}

export function isPublicFeatureEnabled(name: string) {
    const normalized = normalizeFlagName(name);
    const direct = process.env[`NEXT_PUBLIC_FEATURE_${normalized}`];
    if (direct !== undefined) {
        return isTrue(direct);
    }
    const list = parseFlagList(process.env.NEXT_PUBLIC_FEATURE_FLAGS);
    return list.has(name);
}
