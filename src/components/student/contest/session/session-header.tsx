/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { Clock, Loader2, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { isDarkTheme } from "@/lib/theme-config";

interface SessionHeaderProps {
    contestName: string;
    timeLeft: string;
    onFinish?: () => void;
    isFinishing?: boolean;
}

export function SessionHeader({
    contestName,
    timeLeft,
    onFinish,
    isFinishing,
}: SessionHeaderProps) {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [isFinishDialogOpen, setIsFinishDialogOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isDark = isDarkTheme(resolvedTheme);

    return (
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19] px-6 text-slate-800 dark:text-white">
            <div className="flex items-center gap-3">
                <div>
                    <h1 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                        {contestName || "Contest"}
                    </h1>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                        Coding Session
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* Timer Box */}
                <div className="flex items-center gap-2 rounded-lg bg-slate-100 dark:bg-slate-900 px-3 py-1 border border-slate-200 dark:border-slate-800">
                    <Clock className="h-4 w-4 text-indigo-500 dark:text-indigo-400 animate-pulse" />
                    <span className="font-mono text-sm font-extrabold text-slate-750 dark:text-slate-200">
                        {timeLeft}
                    </span>
                </div>

                {/* Theme Switcher Button */}
                {mounted && (
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                        onClick={() => setTheme(isDark ? "light" : "dark")}
                        title={`Switch to ${isDark ? "light" : "dark"} mode`}
                    >
                        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </Button>
                )}

                {/* Finish Session Confirmation Dialog */}
                <Dialog open={isFinishDialogOpen} onOpenChange={setIsFinishDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            variant="destructive"
                            size="sm"
                            className="h-8 font-semibold text-xs"
                            disabled={isFinishing}
                        >
                            {isFinishing ? (
                                <>
                                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                    Finishing...
                                </>
                            ) : (
                                "Finish Contest"
                            )}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1220] text-slate-850 dark:text-slate-200 max-w-sm rounded-xl">
                        <DialogHeader>
                            <DialogTitle className="text-slate-900 dark:text-white flex items-center gap-2 text-base font-bold">
                                Finish Coding Session?
                            </DialogTitle>
                            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                                This action is permanent. Once you finish the contest session, your
                                submissions will be finalized, and you will not be able to write or
                                submit any further code.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-end gap-2 mt-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsFinishDialogOpen(false)}
                                className="h-8 border-slate-200 dark:border-slate-800 text-xs"
                                disabled={isFinishing}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                    setIsFinishDialogOpen(false);
                                    onFinish?.();
                                }}
                                className="h-8 text-xs font-semibold"
                                disabled={isFinishing}
                            >
                                Yes, Finish Contest
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </header>
    );
}
