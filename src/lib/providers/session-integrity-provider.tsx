"use client";

import { useSessionIntegrity } from "../hooks/use-session-integrity";

export function SessionIntegrityProvider({ children }: { children: React.ReactNode }) {
    useSessionIntegrity();
    return <>{children}</>;
}
