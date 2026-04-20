import type { UserResponse } from "@/api/generated/model";

/**
 * Checks if a user is already associated with a specific audience ID.
 * Uses the audience_links property from the UserResponse.
 */
export function isUserInAudience(
    user: UserResponse,
    audienceId: string | number | null | undefined,
): boolean {
    if (!user || !user.audience_links || !audienceId) return false;

    const targetId = String(audienceId);
    return user.audience_links.some((link) => String(link.id) === targetId);
}
