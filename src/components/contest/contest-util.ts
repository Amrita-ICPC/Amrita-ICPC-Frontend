export function getContestStatusBadgeClass(status: string): string {
    switch (status) {
        case "DRAFT":
            return "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20";
        case "RUNNING":
            return "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20";
        case "SCHEDULED":
            return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
        case "PAUSED":
            return "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20";
        case "FINISHED":
            return "bg-zinc-500/10 text-zinc-500 hover:bg-zinc-500/20";
        case "CANCELLED":
            return "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20";
        default:
            return "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20";
    }
}

export function getContestModeBadgeClass(mode: string): string {
    switch (mode) {
        case "team":
            return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
        case "individual":
            return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
        default:
            return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20";
    }
}

export function formatContestLabel(value: string): string {
    return value
        .toLowerCase()
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

export function formatContestDateTime(value: string): string {
    return new Date(value).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

export function isAllowedContestImage(src?: string | null): boolean {
    if (!src) return false;
    if (src.startsWith("/")) return true;

    try {
        const url = new URL(src);

        return (
            (url.protocol === "http:" && url.hostname === "10.10.10.23" && url.port === "9000") ||
            (url.protocol === "http:" && url.hostname === "localhost" && url.port === "9000")
        );
    } catch {
        return false;
    }
}
