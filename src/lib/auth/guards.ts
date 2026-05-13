import type { Session } from "next-auth";

import { hasPermission } from "@/lib/auth/utils";

const ADMIN_PERMISSIONS = ["users:admin"];

export function isAdmin(user: Session["user"] | null | undefined) {
    return hasPermission(user, ADMIN_PERMISSIONS);
}
