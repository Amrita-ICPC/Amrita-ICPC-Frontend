import { ContestMode, ScoringType, TeamApprovalMode } from "@/api/generated/model";
import { z } from "zod";

export const contestFormSchema = z
    .object({
        name: z.string().min(1, "Contest name is required").max(255),
        description: z.string().optional(),
        image: z.string().url().optional().nullable(),
        is_public: z.boolean().optional(),
        start_time: z.string().min(1, "Start time is required"),
        end_time: z.string().min(1, "End time is required"),
        registration_start: z.string().optional(),
        registration_end: z.string().optional(),
        mode: z.enum([ContestMode.individual, ContestMode.team]).optional(),
        max_teams: z.number().int().min(1).optional(),
        min_team_size: z.number().int().min(1).optional(),
        max_team_size: z.number().int().min(1).optional(),
        rules: z.string().optional(),
        scoring_type: z.enum([ScoringType.AUTO, ScoringType.MANUAL, ScoringType.HYBRID]).optional(),
        team_approval_mode: z
            .enum([TeamApprovalMode.AUTO_APPROVE, TeamApprovalMode.INSTRUCTOR_REVIEW])
            .optional(),
        audience_ids: z.array(z.string()).optional(),
    })
    .refine(
        (values) => {
            if (!values.start_time || !values.end_time) return true;
            return new Date(values.end_time).getTime() > new Date(values.start_time).getTime();
        },
        {
            message: "End time must be after start time",
            path: ["end_time"],
        },
    );

export type ContestFormValues = z.infer<typeof contestFormSchema>;
