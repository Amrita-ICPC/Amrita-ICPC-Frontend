"use client";

import { useTheme } from "next-themes";

import { useUpdateMySettingsApiV1UsersMeSettingsPatch } from "@/api/generated/users/users";
import { THEME_IDS } from "@/lib/theme-config";

export function usePersistedTheme() {
    const themeState = useTheme();
    const updateSettings = useUpdateMySettingsApiV1UsersMeSettingsPatch();

    function setPersistedTheme(nextTheme: string) {
        if (!THEME_IDS.includes(nextTheme)) return;

        themeState.setTheme(nextTheme);
        updateSettings.mutate({ data: { theme: nextTheme } });
    }

    return {
        ...themeState,
        setPersistedTheme,
        isSavingTheme: updateSettings.isPending,
    };
}
