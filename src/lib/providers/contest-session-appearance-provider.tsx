"use client";

import { useTheme } from "next-themes";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

import { isDarkTheme, THEME_IDS } from "@/lib/theme-config";

interface ContestSessionAppearanceContextValue {
    isDark: boolean;
    editorTheme: "light" | "vs-dark";
    toggleSessionTheme: () => void;
}

const ContestSessionAppearanceContext = createContext<ContestSessionAppearanceContextValue | null>(
    null,
);

export function ContestSessionAppearanceProvider({ children }: { children: React.ReactNode }) {
    const { theme, resolvedTheme } = useTheme();
    const [sessionIsDark, setSessionIsDark] = useState<boolean | null>(null);
    const nonThemeClassNamesRef = useRef<string[]>([]);
    const accountThemeRef = useRef("light");

    const accountTheme = theme === "system" ? resolvedTheme : theme;
    const safeAccountTheme = THEME_IDS.includes(accountTheme ?? "") ? accountTheme! : "light";
    const accountThemeIsDark = isDarkTheme(safeAccountTheme);
    const isDark = sessionIsDark ?? accountThemeIsDark;

    useEffect(() => {
        accountThemeRef.current = safeAccountTheme;
    }, [safeAccountTheme]);

    useEffect(() => {
        const html = document.documentElement;

        nonThemeClassNamesRef.current = Array.from(html.classList).filter(
            (className) => !THEME_IDS.includes(className),
        );

        return () => {
            html.classList.remove(...THEME_IDS);
            html.classList.add(...nonThemeClassNamesRef.current, accountThemeRef.current);
        };
    }, []);

    useEffect(() => {
        const html = document.documentElement;
        html.classList.remove(...THEME_IDS);
        html.classList.add(isDark ? "dark" : "light");
    }, [isDark, safeAccountTheme]);

    const value = useMemo<ContestSessionAppearanceContextValue>(
        () => ({
            isDark,
            editorTheme: isDark ? "vs-dark" : "light",
            toggleSessionTheme: () => setSessionIsDark((current) => !(current ?? isDark)),
        }),
        [isDark],
    );

    return (
        <ContestSessionAppearanceContext.Provider value={value}>
            {children}
        </ContestSessionAppearanceContext.Provider>
    );
}

export function useContestSessionAppearance() {
    const context = useContext(ContestSessionAppearanceContext);

    if (!context) {
        throw new Error(
            "useContestSessionAppearance must be used within a ContestSessionAppearanceProvider",
        );
    }

    return context;
}
