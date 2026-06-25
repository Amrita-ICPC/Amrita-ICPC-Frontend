"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => setMounted(true), []);

    if (!mounted) {
        return (
            <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-input text-muted-foreground/50 bg-background">
                <Sun className="h-4 w-4" />
            </button>
        );
    }

    const isDark = resolvedTheme === "dark";

    return (
        <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-input bg-background text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            title={`Switch to ${isDark ? "light" : "dark"} mode`}
        >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
    );
}
