interface ContestSessionStatusLike {
    can_start?: boolean;
    already_started?: boolean;
    run_status?: string;
    reason?: string | null;
    completion_status?: "NOT_STARTED" | "IN_PROGRESS" | "FINISHED" | "MISSED";
}

const COMPLETED_REASON =
    /already.*(submitted|finished|completed)|(submitted|finished|completed).*already|session\s+(submitted|finished|completed)|contest\s+(submitted|finished|completed)/i;

export function isContestSessionCompleted(session?: ContestSessionStatusLike | null) {
    if (session?.completion_status) return session.completion_status === "FINISHED";
    if (!session || session.can_start || !session.already_started) return false;
    return session.run_status === "ENDED" || COMPLETED_REASON.test(session.reason ?? "");
}

export function isContestSessionMissed(session?: ContestSessionStatusLike | null) {
    return session?.completion_status === "MISSED";
}

export function isContestSessionTerminal(session?: ContestSessionStatusLike | null) {
    return isContestSessionCompleted(session) || isContestSessionMissed(session);
}

export function getContestSessionUnavailableMessage(session?: ContestSessionStatusLike | null) {
    if (isContestSessionCompleted(session)) {
        return "You have already submitted this contest.";
    }
    if (isContestSessionMissed(session)) {
        return "Your contest session ended because the allotted time expired.";
    }

    return session?.reason || "You are not authorized to access this contest session.";
}
