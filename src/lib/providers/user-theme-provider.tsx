"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

import { getMeApiV1UsersMeGet } from "@/api/generated/users/users";
import { THEME_IDS } from "@/lib/theme-config";

interface UserThemeProviderProps {
    userId: string;
    children: React.ReactNode;
}

type ThemeProfile = {
    theme?: string | null;
};

function isKnownTheme(theme: string | null | undefined): theme is string {
    return Boolean(theme && THEME_IDS.includes(theme));
}

export function UserThemeProvider({ userId, children }: UserThemeProviderProps) {
    const { setTheme } = useTheme();

    useEffect(() => {
        if (!userId) return;

        const hydrationKey = `icpc:user-theme-hydrated:${userId}`;

        if (window.sessionStorage.getItem(hydrationKey) === "true") {
            return;
        }

        let cancelled = false;

        async function hydrateTheme() {
            try {
                const profile = (await getMeApiV1UsersMeGet()) as ThemeProfile;
                const savedTheme = profile.theme;

                if (!cancelled && isKnownTheme(savedTheme)) {
                    setTheme(savedTheme);
                }
            } catch {
                // Theme hydration is a preference enhancement; keep the local theme on failure.
            } finally {
                if (!cancelled) {
                    window.sessionStorage.setItem(hydrationKey, "true");
                }
            }
        }

        void hydrateTheme();

        return () => {
            cancelled = true;
        };
    }, [setTheme, userId]);

    return <>{children}</>;
}
