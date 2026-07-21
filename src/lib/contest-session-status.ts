interface ContestSessionStatusLike {
    can_start?: boolean;
    already_started?: boolean;
    run_status?: string;
    reason?: string | null;
}

const COMPLETED_REASON =
    /already.*(submitted|finished|completed)|(submitted|finished|completed).*already|session\s+(submitted|finished|completed)|contest\s+(submitted|finished|completed)/i;

export function isContestSessionCompleted(session?: ContestSessionStatusLike | null) {
    if (!session || session.can_start || !session.already_started) return false;
    return session.run_status === "ENDED" || COMPLETED_REASON.test(session.reason ?? "");
}

export function getContestSessionUnavailableMessage(session?: ContestSessionStatusLike | null) {
    if (isContestSessionCompleted(session)) {
        return "You have already submitted this contest.";
    }

    return session?.reason || "You are not authorized to access this contest session.";
}
