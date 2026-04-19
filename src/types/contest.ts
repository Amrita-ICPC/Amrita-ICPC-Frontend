export type ContestStatus = "DRAFT" | "SCHEDULED" | "RUNNING" | "PAUSED" | "FINISHED" | "CANCELLED";

export type TeamApprovalMode = "AUTO_APPROVE" | "INSTRUCTOR_REVIEW";

export interface Contest {
    id: string;
    name: string;
    description: string;
    image: string;
    start_time: string;
    end_time: string;
    status: ContestStatus;
    created_at: string;
    is_public: boolean;
    team_approval_mode: TeamApprovalMode;
}

// Client-query convenience types (kept for compatibility).
export type GetContestsParams = {
    page?: number;
    page_size?: number;
    contest_status?: ContestStatus | string;
    search?: string;
    is_public?: boolean;
};

export type PaginatedContestList = {
    items: Contest[];
    total: number;
    page: number;
    size: number;
};
