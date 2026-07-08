"use client";

import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";

import { useUpdateMySettingsApiV1UsersMeSettingsPatch } from "@/api/generated/users/users";
import { THEME_IDS } from "@/lib/theme-config";

const PERSIST_DEBOUNCE_MS = 3000;

export function usePersistedTheme() {
    const themeState = useTheme();
    const { data: session } = useSession();
    const updateSettings = useUpdateMySettingsApiV1UsersMeSettingsPatch();
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Flush any pending write immediately if the component unmounts mid-debounce.
    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    function setPersistedTheme(nextTheme: string) {
        if (!THEME_IDS.includes(nextTheme)) return;

        themeState.setTheme(nextTheme);

        const userId = session?.user?.id;
        if (userId) {
            window.localStorage.setItem(`icpc:user-theme:${userId}`, nextTheme);
        }

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            debounceRef.current = null;
            updateSettings.mutate({ data: { theme: nextTheme } });
        }, PERSIST_DEBOUNCE_MS);
    }

    return {
        ...themeState,
        setPersistedTheme,
        isSavingTheme: updateSettings.isPending,
    };
}
