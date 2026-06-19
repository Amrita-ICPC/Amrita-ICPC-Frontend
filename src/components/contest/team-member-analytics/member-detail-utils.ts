import { SubmissionStatus } from "@/api/generated/model/submissionStatus";

export function numberValue(value?: number | null) {
    return value ?? 0;
}

export function formatDateTime(value?: string | null) {
    if (!value) return "Not recorded";

    return new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));
}

export function formatDuration(seconds?: number | null) {
    const value = numberValue(seconds);
    if (value <= 0) return "0m";

    const minutes = Math.floor(value / 60);
    const remainingSeconds = value % 60;

    if (minutes <= 0) return `${remainingSeconds}s`;
    if (remainingSeconds === 0) return `${minutes}m`;
    return `${minutes}m ${remainingSeconds}s`;
}

export function formatRuntime(ms?: number | null) {
    if (ms === null || ms === undefined) return "Not recorded";
    return `${ms} ms`;
}

export function formatMemory(kb?: number | null) {
    if (kb === null || kb === undefined) return "Not recorded";
    if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB`;
    return `${kb} KB`;
}

export function statusLabel(status?: string | null) {
    if (!status) return "Pending";

    const labels: Record<string, string> = {
        [SubmissionStatus.AC]: "Accepted",
        [SubmissionStatus.WA]: "Wrong Answer",
        [SubmissionStatus.TLE]: "Time Limit",
        [SubmissionStatus.RE]: "Runtime Error",
        [SubmissionStatus.CE]: "Compilation Error",
        [SubmissionStatus.MLE]: "Memory Limit",
        [SubmissionStatus.SYSTEM_ERROR]: "System Error",
    };

    return labels[status] ?? status;
}

export function statusTone(status?: string | null) {
    if (status === SubmissionStatus.AC) {
        return "border-transparent bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
    }

    if (status === SubmissionStatus.WA || status === SubmissionStatus.SYSTEM_ERROR) {
        return "border-transparent bg-red-500/10 text-red-600 dark:text-red-400";
    }

    if (status === SubmissionStatus.TLE || status === SubmissionStatus.RE) {
        return "border-transparent bg-orange-500/10 text-orange-600 dark:text-orange-400";
    }

    if (status === SubmissionStatus.CE || status === SubmissionStatus.MLE) {
        return "border-transparent bg-violet-500/10 text-violet-600 dark:text-violet-400";
    }

    return "border-transparent bg-muted text-muted-foreground";
}

export function difficultyTone(difficulty?: string) {
    if (difficulty === "EASY") {
        return "border-transparent bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
    }

    if (difficulty === "MEDIUM") {
        return "border-transparent bg-amber-500/10 text-amber-600 dark:text-amber-400";
    }

    return "border-transparent bg-red-500/10 text-red-600 dark:text-red-400";
}
