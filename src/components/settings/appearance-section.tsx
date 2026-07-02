"use client";

import { Check, Palette } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { type ThemeDefinition, THEMES } from "@/lib/theme-config";
import { cn } from "@/lib/utils";

function ThemeCard({ theme, selected }: { theme: ThemeDefinition; selected: boolean }) {
    return (
        <label
            htmlFor={`theme-${theme.id}`}
            className={cn(
                "relative flex cursor-pointer flex-col gap-2 rounded-xl border-2 p-2 transition-colors",
                selected ? "border-primary" : "border-border hover:border-primary/40",
            )}
        >
            {selected && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
                    <Check className="h-3 w-3" />
                </span>
            )}

            <div
                className="overflow-hidden rounded-lg border border-black/5"
                style={{ background: theme.previewBg }}
            >
                <div className="h-4" style={{ background: theme.previewHeader }} />
                <div className="space-y-1 p-2">
                    <div className="h-1.5 w-3/4 rounded-full bg-current opacity-25" />
                    <div className="h-1.5 w-1/2 rounded-full bg-current opacity-15" />
                    <div className="mt-1.5 flex items-center gap-1">
                        <div
                            className="h-3 w-8 rounded"
                            style={{ background: theme.previewButton }}
                        />
                        <div className="h-3 w-4 rounded bg-current opacity-10" />
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between px-0.5">
                <span className="text-xs font-medium text-foreground">{theme.name}</span>
                <div className="flex gap-1">
                    {theme.swatches.map((c, i) => (
                        <span
                            key={i}
                            className="h-2.5 w-2.5 rounded-full border border-black/10"
                            style={{ background: c }}
                        />
                    ))}
                </div>
            </div>

            <RadioGroupItem value={theme.id} id={`theme-${theme.id}`} className="sr-only" />
        </label>
    );
}

export function AppearanceSection() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => setMounted(true), []);

    const light = THEMES.filter((t) => t.group === "light");
    const dark = THEMES.filter((t) => t.group === "dark");
    const activeTheme = mounted ? theme : undefined;

    return (
        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_18px_36px_-28px_rgba(18,43,102,0.7)]">
            <div className="flex items-center gap-2 border-b border-[#203a80]/25 bg-[#13285e] px-5 py-3 text-white dark:border-white/10 dark:bg-[#0f214d]">
                <Palette className="h-4.5 w-4.5" />
                <h2 className="text-sm font-semibold tracking-wide">Appearance</h2>
            </div>

            <div className="space-y-6 p-5">
                <RadioGroup value={activeTheme} onValueChange={setTheme}>
                    <div>
                        <p className="mb-2 text-xs font-medium text-muted-foreground">Light</p>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {light.map((t) => (
                                <ThemeCard key={t.id} theme={t} selected={activeTheme === t.id} />
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="mb-2 text-xs font-medium text-muted-foreground">Dark</p>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {dark.map((t) => (
                                <ThemeCard key={t.id} theme={t} selected={activeTheme === t.id} />
                            ))}
                        </div>
                    </div>
                </RadioGroup>
            </div>
        </section>
    );
}
