/**
 * Zod schemas for contest forms
 * Validation for contest creation and editing
 */

import { z } from "zod";

// Base contest object schema (without refinements)
const ContestObjectSchema = z.object({
    name: z
        .string()
        .min(1, "Contest name is required")
        .max(255, "Name must be under 255 characters"),
    description: z
        .string()
        .max(2000, "Description must be under 2000 characters")
        .optional()
        .or(z.literal("")),
    start_time: z.string().min(1, "Start time is required"),
    end_time: z.string().min(1, "End time is required"),
    max_teams: z.number().int().positive().max(1000).optional(),
});

// Create contest schema with refinements
export const CreateContestSchema = ContestObjectSchema.refine(
    (data) => {
        try {
            const start = new Date(data.start_time).getTime();
            const end = new Date(data.end_time).getTime();
            return end > start;
        } catch {
            return false;
        }
    },
    {
        message: "End time must be after start time",
        path: ["end_time"],
    },
).refine(
    (data) => {
        try {
            const now = Date.now();
            const start = new Date(data.start_time).getTime();
            return start > now;
        } catch {
            return false;
        }
    },
    {
        message: "Contest must start in the future",
        path: ["start_time"],
    },
);

// Update contest schema (all fields optional)
export const UpdateContestSchema = ContestObjectSchema.partial().refine(
    (data) => {
        if (!data.start_time || !data.end_time) return true;
        try {
            const start = new Date(data.start_time).getTime();
            const end = new Date(data.end_time).getTime();
            return end > start;
        } catch {
            return false;
        }
    },
    {
        message: "End time must be after start time",
        path: ["end_time"],
    },
);

export type CreateContestPayload = z.infer<typeof CreateContestSchema>;
export type UpdateContestPayload = z.infer<typeof UpdateContestSchema>;
