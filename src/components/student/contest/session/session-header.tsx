/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { Activity, Clock, Loader2, Lock, Moon, Sun, Trophy } from "lucide-react";
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

interface SessionHeaderProps {
    contestName: string;
    timeLeft: string;
    solvedCount: number;
    totalQuestions: number;
    score: number;
    penalty: number;
    hasExtraTime: boolean;
    showLeaderboardDuringContest: boolean;
    isLeaderboardOpen: boolean;
    setIsLeaderboardOpen: (open: boolean) => void;
    onFinish?: () => void;
    isFinishing?: boolean;
}

export function SessionHeader({
    contestName,
    timeLeft,
    solvedCount,
    totalQuestions,
    score,
    penalty,
    hasExtraTime,
    showLeaderboardDuringContest,
    isLeaderboardOpen,
    setIsLeaderboardOpen,
    onFinish,
    isFinishing,
}: SessionHeaderProps) {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [isFinishDialogOpen, setIsFinishDialogOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isDark = resolvedTheme === "dark";

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

                {/* Leaderboard Trigger */}
                <Dialog open={isLeaderboardOpen} onOpenChange={setIsLeaderboardOpen}>
                    <DialogTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                        >
                            <Trophy className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
                            Leaderboard
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1220] text-slate-850 dark:text-slate-200 max-w-md rounded-xl">
                        <DialogHeader>
                            <DialogTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                                <Trophy className="h-5 w-5 text-amber-500" />
                                Contest Scoreboard
                            </DialogTitle>
                            <DialogDescription className="text-slate-500 dark:text-slate-400">
                                Your team standing and performance metrics.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="mt-4 space-y-4">
                            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                                        {solvedCount} Solved
                                    </span>
                                    <span className="text-xs text-slate-550 dark:text-slate-400">
                                        Score: {score}
                                    </span>
                                </div>
                                <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                                    <div
                                        className="h-full bg-indigo-500 rounded-full"
                                        style={{
                                            width: `${(solvedCount / Math.max(1, totalQuestions)) * 100}%`,
                                        }}
                                    />
                                </div>
                                <div className="flex justify-between items-center text-xs text-slate-550 dark:text-slate-400 pt-1">
                                    <span>Penalty: {penalty} mins</span>
                                    {hasExtraTime && (
                                        <span className="text-yellow-600 dark:text-yellow-500 font-medium">
                                            Extra Time Active
                                        </span>
                                    )}
                                </div>
                            </div>

                            {!showLeaderboardDuringContest ? (
                                <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/30">
                                    <Lock className="h-6 w-6 text-slate-450 dark:text-slate-500 mb-2" />
                                    <p className="text-xs font-bold text-slate-750 dark:text-slate-300">
                                        Leaderboard is Blind
                                    </p>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-500 mt-1 max-w-[280px]">
                                        Leaderboard display is hidden during the contest according
                                        to contest rules.
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/30">
                                    <Activity className="h-6 w-6 text-indigo-500 dark:text-indigo-400 mb-2 animate-pulse" />
                                    <p className="text-xs font-bold text-slate-750 dark:text-slate-300">
                                        Live scoreboard is active
                                    </p>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-500 mt-1 max-w-[280px]">
                                        Scoreboard is active. Continue solving questions to improve
                                        your position!
                                    </p>
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>

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
