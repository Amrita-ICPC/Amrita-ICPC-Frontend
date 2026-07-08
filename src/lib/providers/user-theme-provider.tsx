"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";

import { getMySettingsApiV1UsersMeSettingsGet } from "@/api/generated/users/users";
import { THEME_IDS } from "@/lib/theme-config";

interface UserThemeProviderProps {
    userId: string;
    children: React.ReactNode;
}

function isKnownTheme(theme: string | null | undefined): theme is string {
    return Boolean(theme && THEME_IDS.includes(theme));
}

export function UserThemeProvider({ userId, children }: UserThemeProviderProps) {
    const { setTheme } = useTheme();

    // next-themes recreates `setTheme` on every theme change (it closes over the
    // current theme value). Reading it through a ref keeps this effect from
    // re-running on every toggle — it must only run once per login/userId,
    // otherwise it re-fetches the DB value mid-toggle and reverts the user's
    // just-applied change before the debounced PATCH has persisted it.
    const setThemeRef = useRef(setTheme);
    useEffect(() => {
        setThemeRef.current = setTheme;
    }, [setTheme]);

    useEffect(() => {
        if (!userId) return;

        const storageKey = `icpc:user-theme:${userId}`;

        // Apply cached theme immediately to prevent flashing / delays
        const cachedTheme = window.localStorage.getItem(storageKey);
        if (isKnownTheme(cachedTheme)) {
            setThemeRef.current(cachedTheme);
        }

        // Snapshot what's cached right before the request goes out, so we can
        // detect if the user picks a new theme while this request is in flight.
        const themeAtFetchStart = cachedTheme;

        let cancelled = false;

        async function hydrateTheme() {
            try {
                const response = await getMySettingsApiV1UsersMeSettingsGet();
                const savedTheme = response.data?.theme;

                if (cancelled || !isKnownTheme(savedTheme)) return;

                // If the local cache changed since the request started, the user
                // already made a choice — don't stomp it with this stale DB value.
                if (window.localStorage.getItem(storageKey) !== themeAtFetchStart) return;

                setThemeRef.current(savedTheme);
                window.localStorage.setItem(storageKey, savedTheme);
            } catch {
                // Keep the local/cached theme on failure.
            }
        }

        void hydrateTheme();

        return () => {
            cancelled = true;
        };
    }, [userId]);

    return <>{children}</>;
}
