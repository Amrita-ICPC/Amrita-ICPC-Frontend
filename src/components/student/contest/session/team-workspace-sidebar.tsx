"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, X } from "lucide-react";
import { WorkspaceRole } from "@/api/generated/model";
import { cn } from "@/lib/utils";

interface TeamWorkspaceSidebarProps {
    isTeamMode: boolean;
    showTeamSidebar: boolean;
    setShowTeamSidebar: (show: boolean) => void;
    solvedCount: number;
    score: number;
    participants: any[];
}

export function TeamWorkspaceSidebar({
    isTeamMode,
    showTeamSidebar,
    setShowTeamSidebar,
    solvedCount,
    score,
    participants = [],
}: TeamWorkspaceSidebarProps) {
    if (!isTeamMode) return null;

    return (
        <div className="flex h-full min-h-0 shrink-0">
            {/* Vertical toggle tab */}
            <div className="flex flex-col border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19] justify-center items-center px-1.5 gap-2 select-none shrink-0 h-full">
                <button
                    onClick={() => setShowTeamSidebar(!showTeamSidebar)}
                    className={cn(
                        "flex flex-col items-center justify-center p-2 rounded-lg transition-all text-xs font-bold uppercase tracking-wider gap-2 select-none text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800",
                        showTeamSidebar &&
                            "text-indigo-650 dark:text-indigo-400 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800",
                    )}
                    style={{ writingMode: "vertical-rl" }}
                >
                    <Users className="h-4 w-4 mb-1 rotate-90" />
                    Team Workspace
                </button>
            </div>

            {showTeamSidebar && (
                <div className="w-80 shrink-0 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19] flex flex-col h-full text-slate-800 dark:text-slate-200">
                    <div className="flex h-14 shrink-0 items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0d1220]">
                        <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                            Team Workspace
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                            onClick={() => setShowTeamSidebar(false)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 space-y-6">
                        {/* Stats Card */}
                        <div className="bg-slate-100/40 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 space-y-3">
                            <span className="text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-widest">
                                Performance Summary
                            </span>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-white dark:bg-[#0d1220] border border-slate-200 dark:border-slate-800/60 rounded-lg text-center">
                                    <span className="text-[9px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">
                                        Solved
                                    </span>
                                    <p className="text-xl font-black text-slate-850 dark:text-white mt-1">
                                        {solvedCount}
                                    </p>
                                </div>
                                <div className="p-3 bg-white dark:bg-[#0d1220] border border-slate-200 dark:border-slate-800/60 rounded-lg text-center">
                                    <span className="text-[9px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">
                                        Score
                                    </span>
                                    <p className="text-xl font-black text-slate-850 dark:text-white mt-1">
                                        {score}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Team Members List */}
                        <div className="space-y-3">
                            <span className="text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-widest">
                                Workspace Members
                            </span>
                            <div className="divide-y divide-slate-200 dark:divide-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-950/20">
                                {participants.map((member) => (
                                    <div
                                        key={member.user_id}
                                        className="p-3.5 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800/20 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center font-bold text-xs text-indigo-650 dark:text-indigo-400 uppercase">
                                                    {member.name?.charAt(0) || "U"}
                                                </div>
                                                <span
                                                    className={cn(
                                                        "absolute bottom-0 right-0 h-2 w-2 rounded-full border border-white dark:border-[#0b0f19]",
                                                        member.is_online
                                                            ? "bg-emerald-500"
                                                            : "bg-slate-400 dark:bg-slate-600",
                                                    )}
                                                />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-850 dark:text-white flex items-center gap-1.5">
                                                    {member.name}
                                                    {member.is_self && (
                                                        <Badge className="text-[8px] bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 border-transparent font-bold tracking-widest px-1 py-0">
                                                            You
                                                        </Badge>
                                                    )}
                                                </p>
                                                <p className="text-[9px] text-slate-500 capitalize mt-0.5 font-semibold">
                                                    {member.is_online ? "online" : "offline"}
                                                </p>
                                            </div>
                                        </div>

                                        <Badge
                                            className={cn(
                                                "text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 border border-transparent",
                                                member.role === WorkspaceRole.EDITOR
                                                    ? "bg-emerald-500/10 text-emerald-650 dark:text-emerald-400"
                                                    : "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400",
                                            )}
                                        >
                                            {member.role?.toLowerCase() || "read only"}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
