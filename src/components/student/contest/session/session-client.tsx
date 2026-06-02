/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useMemo } from "react";
import {
    useGetStudentContestByIdApiV1StudentsContestsContestIdGet,
    useGetRuntimeSessionApiV1StudentsContestsContestIdRuntimeGet,
    useGetContestQuestionsApiV1StudentsContestsContestIdQuestionsGet,
    useGetContestQuestionDetailsApiV1StudentsContestsContestIdQuestionsQuestionIdGet,
    useGetWorkspaceApiV1StudentsContestsContestIdQuestionsQuestionIdWorkspaceGet,
    useSaveWorkspaceApiV1StudentsContestsContestIdQuestionsQuestionIdWorkspacePut,
    useRunStudentCodeApiV1StudentsContestsContestIdQuestionsQuestionIdRunPost,
} from "@/api/generated/students/students";
import { CheckCircle2, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { WorkspaceRole, StudentCodeRunResponse } from "@/api/generated/model";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { SessionHeader } from "./session-header";
import { ProblemView } from "./problem-view";
import { EditorPanel } from "./editor-panel";
import { TeamWorkspaceSidebar } from "./team-workspace-sidebar";

interface SessionClientProps {
    contestId: string;
}

export function SessionClient({ contestId }: SessionClientProps) {
    // 1. Core Queries
    const { data: contestRes, isLoading: isContestLoading } =
        useGetStudentContestByIdApiV1StudentsContestsContestIdGet(contestId);
    const contest = contestRes?.data;

    const { data: runtimeRes, isLoading: isRuntimeLoading } =
        useGetRuntimeSessionApiV1StudentsContestsContestIdRuntimeGet(contestId);
    const runtimeSession = runtimeRes?.data;

    const { data: questionsRes, isLoading: isQuestionsLoading } =
        useGetContestQuestionsApiV1StudentsContestsContestIdQuestionsGet(contestId);
    const questionsList = useMemo(() => questionsRes?.data?.questions || [], [questionsRes]);

    // 2. State Management
    const [activeQuestionIdState, setActiveQuestionIdState] = useState<string | null>(null);
    const activeQuestionId = activeQuestionIdState || questionsList[0]?.id || null;

    const [selectedLanguageIdState, setSelectedLanguageIdState] = useState<number>(71);
    const [editorCode, setEditorCode] = useState<string>("");
    const [loadedKey, setLoadedKey] = useState<string>("");
    const [showTeamSidebar, setShowTeamSidebar] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [timeLeft, setTimeLeft] = useState<string>("00:00:00");
    const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);

    // Run Code State
    const [runResult, setRunResult] = useState<StudentCodeRunResponse | null>(null);
    const [isRunning, setIsRunning] = useState<boolean>(false);

    // Reset runResult when active question changes
    useEffect(() => {
        setRunResult(null);
    }, [activeQuestionId]);

    // Dynamic width and height limits sizing state
    const [leftWidth, setLeftWidth] = useState<number>(50); // initial percentage (50% left, 50% right)
    const [prevLeftWidth, setPrevLeftWidth] = useState<number>(50);
    const [consoleHeight, setConsoleHeight] = useState<number>(176); // initial px height
    const [prevConsoleHeight, setPrevConsoleHeight] = useState<number>(176);
    const [isConsoleCollapsed, setIsConsoleCollapsed] = useState<boolean>(false);

    // Horizontal split handler (horizontal drag, changes column widths)
    const handleHorizontalMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        const startX = e.clientX;
        const startWidth = leftWidth;

        const onMouseMove = (moveEvent: MouseEvent) => {
            const deltaX = moveEvent.clientX - startX;
            const deltaPercentage = (deltaX / window.innerWidth) * 100;
            const targetWidth = startWidth + deltaPercentage;

            if (targetWidth < 15) {
                setLeftWidth(0);
            } else {
                setLeftWidth(Math.max(20, Math.min(80, targetWidth)));
            }
        };

        const onMouseUp = () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        };

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    };

    // Vertical split handler (vertical drag, changes console panel height)
    const handleVerticalMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsConsoleCollapsed(false);
        const startY = e.clientY;
        const startHeight = consoleHeight;

        const onMouseMove = (moveEvent: MouseEvent) => {
            const deltaY = moveEvent.clientY - startY;
            const targetHeight = startHeight - deltaY;
            if (targetHeight < 50) {
                setIsConsoleCollapsed(true);
            } else {
                setConsoleHeight(Math.max(50, Math.min(500, targetHeight)));
            }
        };

        const onMouseUp = () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        };

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    };

    // 3. Question Detail & Workspace Queries
    const { data: questionDetailsRes, isLoading: isQuestionDetailsLoading } =
        useGetContestQuestionDetailsApiV1StudentsContestsContestIdQuestionsQuestionIdGet(
            contestId,
            activeQuestionId || "",
            { query: { enabled: !!activeQuestionId } },
        );
    const questionDetails = questionDetailsRes?.data;

    const { data: workspaceRes, isSuccess: isWorkspaceLoaded } =
        useGetWorkspaceApiV1StudentsContestsContestIdQuestionsQuestionIdWorkspaceGet(
            contestId,
            activeQuestionId || "",
            { query: { enabled: !!activeQuestionId } },
        );
    const workspaceData = workspaceRes?.data;

    // Determine starter templates
    const currentTemplates = useMemo(() => questionDetails?.templates || [], [questionDetails]);

    const selectedLanguageId = useMemo(() => {
        if (currentTemplates.length === 0) return selectedLanguageIdState;
        const hasLang = currentTemplates.some((t) => t.language_id === selectedLanguageIdState);
        return hasLang ? selectedLanguageIdState : currentTemplates[0].language_id;
    }, [currentTemplates, selectedLanguageIdState]);

    const starterCode =
        currentTemplates.find((t) => t.language_id === selectedLanguageId)?.starter_code || "";

    const currentKey = `${activeQuestionId}_${selectedLanguageId}`;

    // Update active editor and role details
    const currentUserParticipant = runtimeSession?.workspace?.participants?.find((p) => p.is_self);
    const isTeamMode = contest?.contest_mode?.toUpperCase() === "TEAM";
    const isCurrentEditor = !isTeamMode || currentUserParticipant?.role === WorkspaceRole.EDITOR;

    // Sync workspace or starter code in Monaco
    useEffect(() => {
        if (!activeQuestionId || !isWorkspaceLoaded) return;

        // Check if we need to load the question workspace for the first time
        const hasLoadedQuestion = loadedKey.startsWith(`${activeQuestionId}_`);

        if (!hasLoadedQuestion) {
            // First time loading this question: check if workspace has saved code
            if (
                workspaceData &&
                workspaceData.source_code !== null &&
                workspaceData.source_code !== undefined
            ) {
                // If saved workspace exists, use it and update selected language
                if (workspaceData.language_id) {
                    setSelectedLanguageIdState(workspaceData.language_id);
                }
                setEditorCode(workspaceData.source_code);
                setLoadedKey(
                    `${activeQuestionId}_${workspaceData.language_id || selectedLanguageId}`,
                );
            } else {
                // Workspace is None/null: fall back to the starter code template for the currently selected language
                setEditorCode(starterCode);
                setLoadedKey(currentKey);
            }
        } else {
            // Question has already loaded at least once. If user switched the language, update the editor code
            if (loadedKey !== currentKey) {
                const codeToSet =
                    workspaceData && workspaceData.language_id === selectedLanguageId
                        ? workspaceData.source_code
                        : starterCode;
                setEditorCode(codeToSet);
                setLoadedKey(currentKey);
            }
        }
    }, [
        isWorkspaceLoaded,
        workspaceData,
        starterCode,
        currentKey,
        loadedKey,
        activeQuestionId,
        selectedLanguageId,
    ]);

    // 4. Save Code Mutation & Debounce Auto-Save
    const saveWorkspaceMutation =
        useSaveWorkspaceApiV1StudentsContestsContestIdQuestionsQuestionIdWorkspacePut();

    useEffect(() => {
        if (!activeQuestionId || !editorCode || loadedKey !== currentKey) return;

        // Auto-save logic: debounced by 1.5 seconds
        const delayDebounce = setTimeout(() => {
            setIsSaving(true);
            saveWorkspaceMutation.mutate(
                {
                    contestId,
                    questionId: activeQuestionId,
                    data: {
                        source_code: editorCode,
                        language_id: selectedLanguageId,
                    },
                },
                {
                    onSettled: () => setIsSaving(false),
                },
            );
        }, 1500);

        return () => clearTimeout(delayDebounce);
    }, [
        editorCode,
        activeQuestionId,
        selectedLanguageId,
        loadedKey,
        currentKey,
        contestId,
        saveWorkspaceMutation,
    ]);

    const handleManualSave = () => {
        if (!activeQuestionId) return;
        setIsSaving(true);
        saveWorkspaceMutation.mutate(
            {
                contestId,
                questionId: activeQuestionId,
                data: {
                    source_code: editorCode,
                    language_id: selectedLanguageId,
                },
            },
            {
                onSettled: () => setIsSaving(false),
            },
        );
    };

    // 4.5 Run Code Mutation Handler
    const runCodeMutation =
        useRunStudentCodeApiV1StudentsContestsContestIdQuestionsQuestionIdRunPost();

    const handleRun = () => {
        if (!activeQuestionId) return;
        setIsRunning(true);
        setRunResult(null);
        setIsConsoleCollapsed(false);

        runCodeMutation.mutate(
            {
                contestId,
                questionId: activeQuestionId,
                data: {
                    code: editorCode,
                    language_id: selectedLanguageId,
                },
            },
            {
                onSuccess: (res) => {
                    if (res?.data) {
                        setRunResult(res.data);
                    }
                },
                onError: (err) => {
                    console.error("Run error:", err);
                },
                onSettled: () => {
                    setIsRunning(false);
                },
            },
        );
    };

    // 5. Timer Ticking
    useEffect(() => {
        const endTimeStr = runtimeSession?.runtime?.effective_end_time;
        if (!endTimeStr) return;

        const updateTimer = () => {
            const now = new Date().getTime();
            const target = new Date(endTimeStr).getTime();
            const diff = target - now;

            if (diff <= 0) {
                setTimeLeft("00:00:00");
                return;
            }

            const h = Math.floor(diff / 3_600_000);
            const m = Math.floor((diff % 3_600_000) / 60_000);
            const s = Math.floor((diff % 60_000) / 1000);
            setTimeLeft(
                `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`,
            );
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [runtimeSession?.runtime?.effective_end_time]);

    const isGlobalLoading = isContestLoading || isRuntimeLoading || isQuestionsLoading;

    if (isGlobalLoading) {
        return (
            <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-[#090d16] flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                <span className="text-sm font-semibold tracking-wider uppercase">
                    Loading Coding Session...
                </span>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-background text-foreground flex flex-col font-sans select-none">
            {/* Header */}
            <SessionHeader
                contestId={contestId}
                contestName={contest?.name || "Contest"}
                timeLeft={timeLeft}
                solvedCount={runtimeSession?.team_progress?.solved_count || 0}
                totalQuestions={questionsList.length}
                score={runtimeSession?.team_progress?.score || 0}
                penalty={runtimeSession?.team_progress?.penalty || 0}
                hasExtraTime={!!runtimeSession?.team_progress?.has_extra_time}
                showLeaderboardDuringContest={!!contest?.show_leaderboard_during_contest}
                isLeaderboardOpen={isLeaderboardOpen}
                setIsLeaderboardOpen={setIsLeaderboardOpen}
            />

            {/* Questions Tab Selector */}
            <div className="flex h-11 shrink-0 items-center border-b border-border bg-slate-100 dark:bg-[#090d16] px-6 gap-2">
                {questionsList.map((q, idx) => {
                    const isSelected = activeQuestionId === q.id;
                    return (
                        <button
                            key={q.id}
                            onClick={() => setActiveQuestionIdState(q.id)}
                            className={cn(
                                "flex h-full items-center px-4 text-xs font-bold transition-all relative outline-none",
                                isSelected
                                    ? "text-indigo-600 dark:text-white border-b-2 border-indigo-500"
                                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200",
                            )}
                        >
                            <div className="flex items-center gap-1.5">
                                {q.solved && (
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 fill-emerald-500/10" />
                                )}
                                <span>Problem {String.fromCharCode(65 + idx)}</span>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Main Area: Split Screen Workspace */}
            <div className="flex-1 min-h-0 flex overflow-hidden relative bg-background">
                {/* Problem Viewer Wrapper */}
                {leftWidth > 0 && (
                    <div
                        style={{ width: `${leftWidth}%` }}
                        className="h-full shrink-0 flex flex-col min-w-[20%] border-r border-border"
                    >
                        {/* Problem Header Bar */}
                        <div className="flex h-11 shrink-0 items-center justify-between border-b border-border bg-card dark:bg-[#0b0f19] px-6">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Problem Description
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                                onClick={() => {
                                    setPrevLeftWidth(leftWidth);
                                    setLeftWidth(0);
                                }}
                                title="Collapse Description (make editor full-width)"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                        </div>
                        <ProblemView
                            questionDetails={questionDetails}
                            isLoading={isQuestionDetailsLoading}
                        />
                    </div>
                )}

                {/* Resize Splitter Divider */}
                {leftWidth > 0 && (
                    <div
                        onMouseDown={handleHorizontalMouseDown}
                        className="w-1 shrink-0 bg-slate-200 dark:bg-slate-800/85 hover:bg-indigo-500 dark:hover:bg-indigo-400 cursor-col-resize transition-colors h-full"
                    />
                )}

                {/* Editor & Console Panel wrapper */}
                <div className="flex-1 flex flex-col min-w-[20%] h-full">
                    <EditorPanel
                        selectedLanguageId={selectedLanguageId}
                        setSelectedLanguageIdState={setSelectedLanguageIdState}
                        currentTemplates={currentTemplates}
                        isSaving={isSaving}
                        handleManualSave={handleManualSave}
                        isTeamMode={isTeamMode}
                        isCurrentEditor={isCurrentEditor}
                        editorCode={editorCode}
                        setEditorCode={setEditorCode}
                        consoleHeight={consoleHeight}
                        handleConsoleMouseDown={handleVerticalMouseDown}
                        leftWidth={leftWidth}
                        setLeftWidth={setLeftWidth}
                        prevLeftWidth={prevLeftWidth}
                        isConsoleCollapsed={isConsoleCollapsed}
                        setIsConsoleCollapsed={setIsConsoleCollapsed}
                        prevConsoleHeight={prevConsoleHeight}
                        setConsoleHeight={setConsoleHeight}
                        setPrevConsoleHeight={setPrevConsoleHeight}
                        onRun={handleRun}
                        isRunning={isRunning}
                        runResult={runResult}
                    />
                </div>

                {/* Team Sidebar */}
                <TeamWorkspaceSidebar
                    isTeamMode={isTeamMode}
                    showTeamSidebar={showTeamSidebar}
                    setShowTeamSidebar={setShowTeamSidebar}
                    solvedCount={runtimeSession?.team_progress?.solved_count || 0}
                    score={runtimeSession?.team_progress?.score || 0}
                    participants={runtimeSession?.workspace?.participants || []}
                />
            </div>
        </div>
    );
}
