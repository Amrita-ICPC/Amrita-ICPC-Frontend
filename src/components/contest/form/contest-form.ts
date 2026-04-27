import { CreateContestApiV1ContestsPostBody } from "@/api/generated/zod/contests/contests";
import { z } from "zod";

/**
 * Contest form validation schema.
 * Extends the generated API schema to handle UI-specific requirements:
 * - Date fields are treated as strings for compatibility with datetime-local inputs.
 * - Adds cross-field validation for contest duration.
 * - Includes show_leaderboard from the update schema for comprehensive coverage.
 */
export const contestFormSchema = CreateContestApiV1ContestsPostBody.extend({
    start_time: z.string().min(1, "Start time is required"),
    end_time: z.string().min(1, "End time is required"),
    registration_start: z.string().optional().nullable(),
    registration_end: z.string().optional().nullable(),
    image: z.string().url().optional().nullable(),
    audience_ids: z.array(z.string()).optional(),
    show_leaderboard: z.boolean(),
    // Explicitly redeclare fields with defaults to make them required in both input and output types
    // This fixes the type mismatch with zodResolver in React Hook Form
    is_public: z.boolean(),
    min_team_size: z.number().min(1),
    max_team_size: z.number().min(1),
    scoring_type: z.enum(["AUTO", "MANUAL", "HYBRID"]),
    team_approval_mode: z.enum(["AUTO_APPROVE", "INSTRUCTOR_REVIEW"]),
    contest_mode: z.enum(["individual", "team"]),
}).refine(
    (values) => {
        if (!values.start_time || !values.end_time) return true;
        try {
            return new Date(values.end_time).getTime() > new Date(values.start_time).getTime();
        } catch {
            return false;
        }
    },
    {
        message: "End time must be after start time",
        path: ["end_time"],
    },
);

export type ContestFormValues = z.infer<typeof contestFormSchema>;
