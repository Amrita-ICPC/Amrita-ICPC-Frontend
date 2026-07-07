"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
    AlertTriangle,
    CheckCircle2,
    HelpCircle,
    Loader2,
    RotateCcw,
    Search,
    Users,
    Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import {
    getGetEvaluationStatusApiV1ContestsContestIdEvaluationGetQueryKey,
    useEvaluateContestApiV1ContestsContestIdEvaluationPost,
    useGetContestQuestionsApiV1ContestsContestIdQuestionsGet,
    useGetEvaluationStatusApiV1ContestsContestIdEvaluationGet,
} from "@/api/generated/contests/contests";
import { EvaluationScope } from "@/api/generated/model/evaluationScope";
import {
    useGetContestStudentsApiV1ContestsContestIdStudentsGet,
    useGetContestTeamsApiV1ContestsContestIdTeamsGet,
} from "@/api/generated/teams/teams";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function EvaluationDialog({
    contestId,
    defaultScope = EvaluationScope.ALL,
    defaultIds = [],
    trigger,
}: {
    contestId: string;
    defaultScope?: EvaluationScope;
    defaultIds?: string[];
    trigger?: React.ReactNode;
}) {
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);
    const [scope, setScope] = useState<EvaluationScope>(defaultScope);
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<Set<string>>(new Set(defaultIds));
    const [isOverride, setIsOverride] = useState(false);
    const statusQuery = useGetEvaluationStatusApiV1ContestsContestIdEvaluationGet(contestId, {
        query: {
            refetchInterval: (query) => {
                const current = query.state.data?.data?.status;
                return current === "PENDING" || current === "RUNNING" ? 2000 : false;
            },
            retry: false,
        },
    });
    const status = statusQuery.data?.data;
    const active = status?.status === "PENDING" || status?.status === "RUNNING";
    const teamsQuery = useGetContestTeamsApiV1ContestsContestIdTeamsGet(
        contestId,
        { search: search || undefined, page: 1, page_size: 20 },
        { query: { enabled: open && scope === EvaluationScope.TEAMS } },
    );
    const questionsQuery = useGetContestQuestionsApiV1ContestsContestIdQuestionsGet(
        contestId,
        { search: search || undefined, page: 1, page_size: 20 },
        { query: { enabled: open && scope === EvaluationScope.QUESTIONS } },
    );
    const studentsQuery = useGetContestStudentsApiV1ContestsContestIdStudentsGet(
        contestId,
        { search: search || undefined, page: 1, page_size: 20 },
        { query: { enabled: open && scope === EvaluationScope.STUDENTS } },
    );
    const options = useMemo(() => {
        if (scope === EvaluationScope.TEAMS)
            return (teamsQuery.data?.data?.teams ?? []).map((item) => ({
                id: item.id,
                label: item.name,
                detail: "Team",
            }));
        if (scope === EvaluationScope.QUESTIONS)
            return (questionsQuery.data?.data?.questions ?? []).map((item) => ({
                id: item.id,
                label: item.title,
                detail: item.difficulty,
            }));
        if (scope === EvaluationScope.STUDENTS)
            return (studentsQuery.data?.data ?? []).map((item) => ({
                id: item.contest_team_member_id,
                label: item.name,
                detail: `${item.email} · ${item.team_name}`,
            }));
        return [];
    }, [scope, teamsQuery.data, questionsQuery.data, studentsQuery.data]);
    const mutation = useEvaluateContestApiV1ContestsContestIdEvaluationPost({
        mutation: {
            onSuccess: async () => {
                toast.success(active ? "Evaluation restarted" : "Evaluation started");
                await queryClient.invalidateQueries({
                    queryKey:
                        getGetEvaluationStatusApiV1ContestsContestIdEvaluationGetQueryKey(
                            contestId,
                        ),
                });
            },
            onError: () => toast.error("Could not start evaluation"),
        },
    });
    const total = status?.total_submissions ?? 0;
    const processed = status?.processed_submissions ?? 0;
    const percentage =
        status?.status === "COMPLETED"
            ? 100
            : total > 0
              ? Math.round((processed / total) * 100)
              : 0;
    const toggle = (id: string) =>
        setSelected((current) => {
            const next = new Set(current);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    const start = () =>
        mutation.mutate({
            contestId,
            data: {
                scope,
                team_ids: scope === EvaluationScope.TEAMS ? [...selected] : undefined,
                question_ids: scope === EvaluationScope.QUESTIONS ? [...selected] : undefined,
                student_ids: scope === EvaluationScope.STUDENTS ? [...selected] : undefined,
                is_override: isOverride,
            },
        });

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button>
                        {active ? <RotateCcw className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                        {active ? "Restart evaluation" : "Evaluate"}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-2xl rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Zap className="h-5 w-5 text-primary" />
                        Evaluate submissions
                    </DialogTitle>
                    <DialogDescription>
                        Run the automated evaluator for this contest.
                    </DialogDescription>
                </DialogHeader>
                {status && (
                    <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                        <div className="flex items-center justify-between">
                            <p className="font-medium">
                                {active ? "Evaluation in progress" : "Last evaluation"}
                            </p>
                            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                {active ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                )}
                                {status.status}
                            </span>
                        </div>
                        <Progress value={percentage} className="mt-3 h-2" />
                        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                            <span>
                                {processed} / {total} submissions evaluated
                            </span>
                            <span>{percentage}%</span>
                        </div>
                    </div>
                )}
                <Tabs
                    value={scope}
                    onValueChange={(value) => {
                        setScope(value as EvaluationScope);
                        setSelected(new Set());
                        setSearch("");
                    }}
                >
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value={EvaluationScope.ALL}>
                            <Zap className="h-4 w-4" />
                            All
                        </TabsTrigger>
                        <TabsTrigger value={EvaluationScope.TEAMS}>
                            <Users className="h-4 w-4" />
                            Teams
                        </TabsTrigger>
                        <TabsTrigger value={EvaluationScope.STUDENTS}>
                            <Users className="h-4 w-4" />
                            Students
                        </TabsTrigger>
                        <TabsTrigger value={EvaluationScope.QUESTIONS}>
                            <HelpCircle className="h-4 w-4" />
                            Questions
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
                <div className="flex items-start justify-between gap-4 rounded-xl border border-border/60 bg-muted/20 p-4">
                    <div className="space-y-1">
                        <Label htmlFor="evaluation-override" className="font-medium">
                            Override existing evaluations
                        </Label>
                        <p className="max-w-lg text-xs leading-5 text-muted-foreground">
                            Re-run submissions that already have a verdict. Their current status and
                            test-case output will be cleared before evaluation. Leave this off to
                            evaluate only submissions without a status.
                        </p>
                    </div>
                    <Switch
                        id="evaluation-override"
                        checked={isOverride}
                        onCheckedChange={setIsOverride}
                        aria-label="Override existing evaluations"
                    />
                </div>
                {isOverride && (
                    <div className="flex gap-3 rounded-xl border border-warning/30 bg-warning/5 p-4 text-sm">
                        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
                        <div>
                            <p className="font-medium text-foreground">
                                Existing evaluation results will be cleared
                            </p>
                            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                All existing verdicts and test-case output within the selected scope
                                will be removed before those submissions are evaluated again.
                            </p>
                        </div>
                    </div>
                )}
                {scope === EvaluationScope.ALL ? (
                    <p className="rounded-xl bg-muted/30 p-4 text-sm text-muted-foreground">
                        Evaluate every submitted solution across all teams and questions.
                    </p>
                ) : (
                    <div className="space-y-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder={`Search ${scope.toLowerCase()}...`}
                                className="pl-9"
                            />
                        </div>
                        <div className="max-h-56 space-y-1 overflow-auto rounded-xl border border-border/60 p-2">
                            {options.map((option) => (
                                <label
                                    key={option.id}
                                    className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-muted/50"
                                >
                                    <Checkbox
                                        checked={selected.has(option.id)}
                                        onCheckedChange={() => toggle(option.id)}
                                    />
                                    <div>
                                        <p className="text-sm font-medium">{option.label}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {option.detail}
                                        </p>
                                    </div>
                                </label>
                            ))}
                            {options.length === 0 && (
                                <p className="p-4 text-center text-sm text-muted-foreground">
                                    No matching results.
                                </p>
                            )}
                        </div>
                    </div>
                )}
                <Button
                    size="lg"
                    onClick={start}
                    disabled={
                        mutation.isPending || (scope !== EvaluationScope.ALL && selected.size === 0)
                    }
                >
                    {mutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : active ? (
                        <RotateCcw className="h-4 w-4" />
                    ) : (
                        <Zap className="h-4 w-4" />
                    )}
                    {mutation.isPending
                        ? active
                            ? "Restarting evaluation"
                            : "Starting evaluation"
                        : active
                          ? "Restart evaluation"
                          : "Start evaluation"}
                </Button>
            </DialogContent>
        </Dialog>
    );
}
