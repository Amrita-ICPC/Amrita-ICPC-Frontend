"use client";

import { Check, Loader2, Moon, Palette, Sparkles, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { type ThemeDefinition, THEMES } from "@/lib/theme-config";
import { usePersistedTheme } from "@/lib/use-persisted-theme";
import { cn } from "@/lib/utils";

function ThemeCard({ theme, selected }: { theme: ThemeDefinition; selected: boolean }) {
    return (
        <label
            htmlFor={`theme-${theme.id}`}
            className={cn(
                "group relative flex cursor-pointer flex-col gap-3 rounded-2xl border bg-background/60 p-3 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md",
                selected
                    ? "border-primary shadow-md shadow-primary/10 ring-4 ring-primary/10"
                    : "border-border/70",
            )}
        >
            {selected && (
                <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25">
                    <Check className="h-3.5 w-3.5" />
                </span>
            )}

            <div
                className="overflow-hidden rounded-xl border border-black/5 shadow-inner"
                style={{ background: theme.previewBg }}
            >
                <div className="h-5" style={{ background: theme.previewHeader }} />
                <div className="space-y-2 p-3">
                    <div className="h-2 w-3/4 rounded-full bg-current opacity-25" />
                    <div className="h-2 w-1/2 rounded-full bg-current opacity-15" />
                    <div className="mt-2 flex items-center gap-1.5">
                        <div
                            className="h-4 w-10 rounded-md"
                            style={{ background: theme.previewButton }}
                        />
                        <div className="h-4 w-6 rounded-md bg-current opacity-10" />
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between px-0.5">
                <span className="text-sm font-semibold text-foreground">{theme.name}</span>
                <div className="flex gap-1">
                    {theme.swatches.map((c, i) => (
                        <span
                            key={i}
                            className="h-3 w-3 rounded-full border border-black/10 shadow-sm"
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
    const { theme, setPersistedTheme, isSavingTheme } = usePersistedTheme();
    const [mounted, setMounted] = useState(false);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => setMounted(true), []);

    const light = THEMES.filter((t) => t.group === "light");
    const dark = THEMES.filter((t) => t.group === "dark");
    const activeTheme = mounted ? theme : undefined;

    return (
        <Card className="overflow-hidden border-border/70 bg-card/95 py-0 shadow-sm">
            <CardHeader className="border-b border-border/70 bg-muted/20 px-5 py-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <Palette className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                Appearance
                            </CardTitle>
                            <CardDescription>
                                Choose a theme. Your preference is saved to your account.
                            </CardDescription>
                        </div>
                    </div>
                    <Badge
                        variant="outline"
                        className="w-fit border-border/70 bg-background/70 text-muted-foreground"
                    >
                        {isSavingTheme ? (
                            <>
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Saving
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-3 w-3" />
                                Synced
                            </>
                        )}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-6 p-5">
                <RadioGroup value={activeTheme} onValueChange={setPersistedTheme}>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <Sun className="h-4 w-4 text-amber-500" />
                            Light themes
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            {light.map((t) => (
                                <ThemeCard key={t.id} theme={t} selected={activeTheme === t.id} />
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <Moon className="h-4 w-4 text-indigo-500" />
                            Dark themes
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            {dark.map((t) => (
                                <ThemeCard key={t.id} theme={t} selected={activeTheme === t.id} />
                            ))}
                        </div>
                    </div>
                </RadioGroup>
            </CardContent>
        </Card>
    );
}
