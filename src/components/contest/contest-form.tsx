"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
    Globe2,
    LockKeyhole,
    School,
    Search,
    Settings2,
    UserCog,
    UserPlus,
    Users,
    X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import type {
    AudienceBriefResponse,
    ContestCreate,
    ContestDetailResponse,
    ContestUpdate,
    UserResponse,
} from "@/api/generated/model";
import type { ImageUploadResponse } from "@/api/generated/model";
import {
    ContestMode,
    ContestTeamParticipationType,
    ScoringType,
    TeamApprovalMode,
    UserRole,
} from "@/api/generated/model";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useDebounce } from "@/hooks/use-debounce";
import {
    contestDetailKey,
    contestKeys,
    useAssignInstructors,
    useCreateContest,
    useListUsers,
    useMyAudiences,
    useUpdateContest,
    useUploadContestImage,
} from "@/query/contest-query";

import { AudiencesSection } from "./audiences-section";
import { InstructorsSection } from "./instructors-section";

function pad2(value: number) {
    return String(value).padStart(2, "0");
}

function toDateTimeLocalValue(date: Date) {
    const year = date.getFullYear();
    const month = pad2(date.getMonth() + 1);
    const day = pad2(date.getDate());
    const hours = pad2(date.getHours());
    const minutes = pad2(date.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function toUtcIsoString(dateTimeLocal: string) {
    // HTML datetime-local is interpreted as local time. Convert to UTC ISO for backend.
    return new Date(dateTimeLocal).toISOString();
}

function toLocalValue(iso: string | null | undefined): string {
    if (!iso) return "";
    const date = new Date(iso);
    if (isNaN(date.getTime())) return "";
    return toDateTimeLocalValue(date);
}

const formSchema = z
    .object({
        name: z.string().min(1, "Contest name is required").max(255),
        description: z.string().optional(),
        image: z.url().optional().nullable(),
        is_public: z.boolean().optional(),
        start_time: z.string().min(1, "Start time is required"),
        end_time: z.string().min(1, "End time is required"),
        registration_start: z.string().optional(),
        registration_end: z.string().optional(),
        duration: z.number().int().min(1).optional().nullable(),
        max_teams: z.number().int().min(1).optional(),
        min_team_size: z.number().int().min(1).optional(),
        max_team_size: z.number().int().min(1).optional(),
        rules: z.string().optional(),
        scoring_type: z.enum([ScoringType.AUTO, ScoringType.MANUAL, ScoringType.HYBRID]).optional(),
        team_approval_mode: z
            .enum([TeamApprovalMode.AUTO_APPROVE, TeamApprovalMode.INSTRUCTOR_REVIEW])
            .optional(),
        contest_mode: z.enum([ContestMode.individual, ContestMode.team]).optional(),
        show_leaderboard_during_contest: z.boolean().optional(),
        evaluate_on_submit: z.boolean().optional(),
        shuffle_questions: z.boolean().optional(),
        participation_type: z
            .enum([
                ContestTeamParticipationType.LEADER_ONLY,
                ContestTeamParticipationType.INDIVIDUAL_WORKSPACE,
            ])
            .optional()
            .nullable(),
        max_submission_per_question: z.number().int().min(1).optional().nullable(),
        audience_ids: z.array(z.string()).optional(),
        instructor_ids: z.array(z.string()).optional(),
    })
    .refine(
        (values) => {
            if (!values.start_time || !values.end_time) return true;
            return new Date(values.end_time).getTime() > new Date(values.start_time).getTime();
        },
        {
            message: "End time must be after start time",
            path: ["end_time"],
        },
    );

type FormValues = z.infer<typeof formSchema>;

export interface ContestFormProps {
    initialData?: ContestDetailResponse;
    contestId?: string;
}

export function ContestForm({ initialData, contestId }: ContestFormProps) {
    const router = useRouter();

    const now = useMemo(() => {
        const start = new Date();
        start.setSeconds(0);
        start.setMilliseconds(0);
        start.setMinutes(0);
        start.setHours(start.getHours() + 1);

        const end = new Date(start);
        end.setHours(end.getHours() + 2);

        return { start, end };
    }, []);

    const {
        register,
        handleSubmit,
        control,
        setError,
        setValue,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialData?.name ?? "",
            description: initialData?.description ?? "",
            image: initialData?.image ?? null,
            is_public: initialData?.is_public ?? true,
            start_time: initialData?.start_time
                ? toLocalValue(initialData.start_time)
                : toDateTimeLocalValue(now.start),
            end_time: initialData?.end_time
                ? toLocalValue(initialData.end_time)
                : toDateTimeLocalValue(now.end),
            registration_start: toLocalValue(initialData?.registration_start),
            registration_end: toLocalValue(initialData?.registration_end),
            duration: initialData?.duration ? Math.round(initialData.duration / 60) : undefined,
            max_teams: initialData?.max_teams ?? undefined,
            min_team_size: initialData?.min_team_size ?? 1,
            max_team_size: initialData?.max_team_size ?? 3,
            rules: initialData?.rules ?? "",
            scoring_type: initialData?.scoring_type ?? ScoringType.AUTO,
            team_approval_mode: initialData?.team_approval_mode ?? TeamApprovalMode.AUTO_APPROVE,
            contest_mode: initialData?.contest_mode ?? ContestMode.individual,
            show_leaderboard_during_contest: initialData?.show_leaderboard_during_contest ?? true,
            evaluate_on_submit: initialData?.evaluate_on_submit ?? true,
            shuffle_questions: initialData?.shuffle_questions ?? false,
            participation_type:
                initialData?.participation_type ?? ContestTeamParticipationType.LEADER_ONLY,
            max_submission_per_question: initialData?.max_submission_per_question ?? undefined,
            audience_ids: [],
            instructor_ids: [],
        },
        mode: "onTouched",
    });

    const imageUrl = useWatch({ control, name: "image" }) ?? null;
    const contestMode = useWatch({ control, name: "contest_mode" }) ?? ContestMode.individual;
    const isPublic = useWatch({ control, name: "is_public" }) ?? true;

    useEffect(() => {
        if (contestMode === ContestMode.individual) {
            setValue("min_team_size", 1);
            setValue("max_team_size", 1);
        }
    }, [contestMode, setValue]);

    const [uploadedImage, setUploadedImage] = useState<ImageUploadResponse | null>(null);
    const uploadImageMutation = useUploadContestImage({
        mutation: {
            meta: { successMessage: "Image uploaded successfully" },
        },
    });
    const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
    const [activeFormTab, setActiveFormTab] = useState("details");
    const [audienceSearch, setAudienceSearch] = useState("");
    const [selectedAudiences, setSelectedAudiences] = useState<AudienceBriefResponse[]>([]);
    const [instructorSearch, setInstructorSearch] = useState("");
    const [selectedInstructors, setSelectedInstructors] = useState<UserResponse[]>([]);
    const debouncedAudienceSearch = useDebounce(audienceSearch, 300);
    const debouncedInstructorSearch = useDebounce(instructorSearch, 300);
    const { data: audiencesData, isLoading: isLoadingAudiences } = useMyAudiences(
        {
            q: debouncedAudienceSearch || undefined,
            page: 1,
            page_size: 50,
        },
        { query: { enabled: !initialData } },
    );
    const availableAudiences = audiencesData?.data ?? [];
    const { data: instructorsData, isLoading: isLoadingInstructorSearch } = useListUsers(
        {
            q: debouncedInstructorSearch || undefined,
            role: UserRole.instructor,
            page: 1,
            page_size: 20,
        },
        {
            query: { enabled: !initialData && debouncedInstructorSearch.length >= 2 },
        },
    );
    const availableInstructors = instructorsData?.data ?? [];

    const createContestMutation = useCreateContest({
        mutation: {
            meta: {
                successMessage: "Contest created successfully",
                invalidateKeys: [contestKeys()],
            },
        },
    });
    const updateContestMutation = useUpdateContest({
        mutation: {
            meta: {
                successMessage: "Contest updated successfully",
                invalidateKeys: [contestKeys(), contestDetailKey(contestId!)],
            },
        },
    });
    const assignInstructorsMutation = useAssignInstructors();
    async function onPickImage(file: File) {
        const result = await uploadImageMutation.mutateAsync({ data: { file } });
        if (result.data) {
            setUploadedImage(result.data);
            setValue("image", result.data.url, { shouldDirty: true, shouldTouch: true });
        }
    }

    const onSubmit = handleSubmit(
        async (values) => {
            if (!initialData && !values.is_public && !values.audience_ids?.length) {
                setError("audience_ids", {
                    message: "Select at least one audience for a private contest",
                });
                setActiveFormTab("access");
                return;
            }

            if (initialData && contestId) {
                const payload: ContestUpdate = {
                    name: values.name,
                    description: values.description?.trim() ? values.description.trim() : null,
                    image: values.image ?? null,
                    is_public: values.is_public,
                    start_time: toUtcIsoString(values.start_time),
                    end_time: toUtcIsoString(values.end_time),
                    registration_start: values.registration_start?.trim()
                        ? toUtcIsoString(values.registration_start)
                        : null,
                    registration_end: values.registration_end?.trim()
                        ? toUtcIsoString(values.registration_end)
                        : null,
                    duration: Number.isFinite(values.duration ?? NaN)
                        ? values.duration! * 60
                        : null,
                    max_teams: Number.isFinite(values.max_teams ?? NaN) ? values.max_teams! : null,
                    min_team_size:
                        values.contest_mode === ContestMode.individual ? 1 : values.min_team_size,
                    max_team_size:
                        values.contest_mode === ContestMode.individual ? 1 : values.max_team_size,
                    rules: values.rules?.trim() ? values.rules.trim() : null,
                    scoring_type: values.scoring_type,
                    team_approval_mode: values.team_approval_mode,
                    contest_mode: values.contest_mode,
                    show_leaderboard_during_contest: values.show_leaderboard_during_contest,
                    evaluate_on_submit: values.evaluate_on_submit,
                    shuffle_questions: values.shuffle_questions,
                    participation_type:
                        values.contest_mode === ContestMode.team ? values.participation_type : null,
                    max_submission_per_question: values.max_submission_per_question ?? null,
                };
                await updateContestMutation.mutateAsync({
                    contestId,
                    data: payload,
                });
            } else {
                const payload: ContestCreate = {
                    name: values.name,
                    description: values.description?.trim() ? values.description.trim() : null,
                    image: values.image ?? null,
                    is_public: values.is_public,
                    start_time: toUtcIsoString(values.start_time),
                    end_time: toUtcIsoString(values.end_time),
                    registration_start: values.registration_start?.trim()
                        ? toUtcIsoString(values.registration_start)
                        : null,
                    registration_end: values.registration_end?.trim()
                        ? toUtcIsoString(values.registration_end)
                        : null,
                    duration: Number.isFinite(values.duration ?? NaN)
                        ? values.duration! * 60
                        : null,
                    max_teams: Number.isFinite(values.max_teams ?? NaN) ? values.max_teams! : null,
                    min_team_size:
                        values.contest_mode === ContestMode.individual ? 1 : values.min_team_size,
                    max_team_size:
                        values.contest_mode === ContestMode.individual ? 1 : values.max_team_size,
                    rules: values.rules?.trim() ? values.rules.trim() : null,
                    scoring_type: values.scoring_type,
                    team_approval_mode: values.team_approval_mode,
                    contest_mode: values.contest_mode,
                    show_leaderboard_during_contest: values.show_leaderboard_during_contest,
                    evaluate_on_submit: values.evaluate_on_submit ?? true,
                    shuffle_questions: values.shuffle_questions ?? false,
                    participation_type:
                        values.contest_mode === ContestMode.team
                            ? (values.participation_type ?? undefined)
                            : undefined,
                    max_submission_per_question: values.max_submission_per_question ?? null,
                    audience_ids: values.is_public ? [] : (values.audience_ids ?? []),
                };
                const createdContest = await createContestMutation.mutateAsync({ data: payload });
                const createdData = createdContest.data;
                const createdContestId =
                    createdData &&
                    typeof createdData === "object" &&
                    "id" in createdData &&
                    typeof createdData.id === "string"
                        ? createdData.id
                        : null;
                if (createdContestId && values.instructor_ids?.length) {
                    await assignInstructorsMutation.mutateAsync({
                        contestId: createdContestId,
                        data: { instructor_ids: values.instructor_ids },
                    });
                }
            }

            router.push("/contest");
            router.refresh();
        },
        (validationErrors) =>
            setActiveFormTab(validationErrors.audience_ids ? "access" : "details"),
    );

    return (
        <>
            <form id="contest-form" onSubmit={onSubmit}>
                <Card className="overflow-visible border-border/60 p-6 shadow-sm">
                    <Tabs
                        value={activeFormTab}
                        onValueChange={setActiveFormTab}
                        className="space-y-6"
                    >
                        <div>
                            <TabsList className="grid h-auto min-w-0 flex-1 grid-cols-1 rounded-xl border border-border/60 bg-muted/40 p-1.5 sm:grid-cols-3">
                                <TabsTrigger
                                    value="details"
                                    className="group h-auto items-start justify-start gap-3 rounded-lg px-4 py-3 text-left data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
                                >
                                    <Settings2 className="mt-0.5 size-5 shrink-0" />
                                    <span>
                                        <span className="block font-semibold">Contest Details</span>
                                        <span className="mt-0.5 block text-xs font-normal text-muted-foreground group-data-[state=active]:text-primary-foreground/75">
                                            Information, schedule, and settings
                                        </span>
                                    </span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="access"
                                    className="group h-auto items-start justify-start gap-3 rounded-lg px-4 py-3 text-left data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
                                >
                                    <Users className="mt-0.5 size-5 shrink-0" />
                                    <span>
                                        <span className="block font-semibold">
                                            Participant Access
                                        </span>
                                        <span className="mt-0.5 block text-xs font-normal text-muted-foreground group-data-[state=active]:text-primary-foreground/75">
                                            Visibility and allowed audiences
                                        </span>
                                    </span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="instructors"
                                    className="group h-auto items-start justify-start gap-3 rounded-lg px-4 py-3 text-left data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
                                >
                                    <UserCog className="mt-0.5 size-5 shrink-0" />
                                    <span>
                                        <span className="block font-semibold">Instructors</span>
                                        <span className="mt-0.5 block text-xs font-normal text-muted-foreground group-data-[state=active]:text-primary-foreground/75">
                                            Choose contest managers
                                        </span>
                                    </span>
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="details" className="m-0">
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                                <Card className="lg:col-span-2">
                                    <CardHeader className="space-y-1">
                                        <CardTitle>
                                            {initialData
                                                ? "Edit Contest Details"
                                                : "Contest Details"}
                                        </CardTitle>
                                        <CardDescription>
                                            Provide the core information participants will see.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div className="space-y-2 md:col-span-2">
                                                <Label htmlFor="name">Name</Label>
                                                <Input
                                                    id="name"
                                                    placeholder="e.g. ICPC Warmup Round"
                                                    {...register("name")}
                                                />
                                                {errors.name && (
                                                    <p className="text-sm text-destructive">
                                                        {errors.name.message}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2 md:col-span-2">
                                                <Label htmlFor="description">Description</Label>
                                                <Textarea
                                                    id="description"
                                                    placeholder="Short summary of the contest"
                                                    rows={4}
                                                    {...register("description")}
                                                />
                                                {errors.description && (
                                                    <p className="text-sm text-destructive">
                                                        {errors.description.message}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <Separator />

                                        <div className="space-y-4">
                                            <div>
                                                <h3 className="text-sm font-semibold">Schedule</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Times are entered in your local timezone and
                                                    saved as UTC.
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label htmlFor="start_time">Start time</Label>
                                                    <Input
                                                        id="start_time"
                                                        type="datetime-local"
                                                        {...register("start_time")}
                                                    />
                                                    {errors.start_time && (
                                                        <p className="text-sm text-destructive">
                                                            {errors.start_time.message}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="end_time">End time</Label>
                                                    <Input
                                                        id="end_time"
                                                        type="datetime-local"
                                                        {...register("end_time")}
                                                    />
                                                    {errors.end_time && (
                                                        <p className="text-sm text-destructive">
                                                            {errors.end_time.message}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label htmlFor="registration_start">
                                                        Registration start
                                                    </Label>
                                                    <Input
                                                        id="registration_start"
                                                        type="datetime-local"
                                                        {...register("registration_start")}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="registration_end">
                                                        Registration end
                                                    </Label>
                                                    <Input
                                                        id="registration_end"
                                                        type="datetime-local"
                                                        {...register("registration_end")}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label htmlFor="duration">
                                                        Session Duration (Minutes)
                                                    </Label>
                                                    <Input
                                                        id="duration"
                                                        type="number"
                                                        min={1}
                                                        placeholder="No limit (runs until end time)"
                                                        {...register("duration", {
                                                            setValueAs: (value) => {
                                                                if (value === "") return undefined;
                                                                const parsed = Number(value);
                                                                return Number.isFinite(parsed)
                                                                    ? parsed
                                                                    : undefined;
                                                            },
                                                        })}
                                                    />
                                                    {errors.duration && (
                                                        <p className="text-sm text-destructive">
                                                            {errors.duration.message}
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-muted-foreground">
                                                        Optional limit on each participant&apos;s
                                                        coding session length.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <Separator />

                                        <div className="space-y-4">
                                            <div>
                                                <h3 className="text-sm font-semibold">
                                                    Participation
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Limits and team settings for this contest.
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label>Contest mode</Label>
                                                    <Controller
                                                        control={control}
                                                        name="contest_mode"
                                                        render={({ field }) => (
                                                            <Select
                                                                value={field.value}
                                                                onValueChange={(value) =>
                                                                    field.onChange(value)
                                                                }
                                                            >
                                                                <SelectTrigger className="w-full">
                                                                    <SelectValue placeholder="Select mode" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem
                                                                        value={
                                                                            ContestMode.individual
                                                                        }
                                                                    >
                                                                        Individual
                                                                    </SelectItem>
                                                                    <SelectItem
                                                                        value={ContestMode.team}
                                                                    >
                                                                        Team
                                                                    </SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        )}
                                                    />
                                                </div>

                                                {contestMode === ContestMode.team && (
                                                    <div className="space-y-2 md:col-span-2">
                                                        <Label>Team Participation Mode</Label>
                                                        <Controller
                                                            control={control}
                                                            name="participation_type"
                                                            render={({ field }) => (
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            field.onChange(
                                                                                ContestTeamParticipationType.LEADER_ONLY,
                                                                            )
                                                                        }
                                                                        className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all hover:bg-muted/30 ${
                                                                            field.value ===
                                                                            ContestTeamParticipationType.LEADER_ONLY
                                                                                ? "border-primary bg-primary/5 ring-1 ring-primary"
                                                                                : "border-border/60 bg-card text-card-foreground"
                                                                        }`}
                                                                    >
                                                                        <span className="font-semibold text-sm mb-1">
                                                                            Leader Only
                                                                        </span>
                                                                        <span className="text-xs text-muted-foreground leading-normal">
                                                                            Only the team leader is
                                                                            allowed to write and
                                                                            submit code. Other
                                                                            members have read-only
                                                                            access.
                                                                        </span>
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            field.onChange(
                                                                                ContestTeamParticipationType.INDIVIDUAL_WORKSPACE,
                                                                            )
                                                                        }
                                                                        className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all hover:bg-muted/30 ${
                                                                            field.value ===
                                                                            ContestTeamParticipationType.INDIVIDUAL_WORKSPACE
                                                                                ? "border-primary bg-primary/5 ring-1 ring-primary"
                                                                                : "border-border/60 bg-card text-card-foreground"
                                                                        }`}
                                                                    >
                                                                        <span className="font-semibold text-sm mb-1">
                                                                            Individual Workspaces
                                                                        </span>
                                                                        <span className="text-xs text-muted-foreground leading-normal">
                                                                            Each team member gets
                                                                            their own separate
                                                                            workspace. They can code
                                                                            and submit
                                                                            independently.
                                                                        </span>
                                                                    </button>
                                                                </div>
                                                            )}
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                                <div className="space-y-2">
                                                    <Label htmlFor="max_teams">Max teams</Label>
                                                    <Input
                                                        id="max_teams"
                                                        type="number"
                                                        min={1}
                                                        placeholder="No limit"
                                                        {...register("max_teams", {
                                                            setValueAs: (value) => {
                                                                if (value === "") return undefined;
                                                                const parsed = Number(value);
                                                                return Number.isFinite(parsed)
                                                                    ? parsed
                                                                    : undefined;
                                                            },
                                                        })}
                                                    />
                                                    {errors.max_teams && (
                                                        <p className="text-sm text-destructive">
                                                            {errors.max_teams.message}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="min_team_size">
                                                        Min team size
                                                    </Label>
                                                    <Input
                                                        id="min_team_size"
                                                        type="number"
                                                        min={1}
                                                        disabled={
                                                            contestMode === ContestMode.individual
                                                        }
                                                        {...register("min_team_size", {
                                                            valueAsNumber: true,
                                                        })}
                                                    />
                                                    {errors.min_team_size && (
                                                        <p className="text-sm text-destructive">
                                                            {errors.min_team_size.message}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="max_team_size">
                                                        Max team size
                                                    </Label>
                                                    <Input
                                                        id="max_team_size"
                                                        type="number"
                                                        min={1}
                                                        disabled={
                                                            contestMode === ContestMode.individual
                                                        }
                                                        {...register("max_team_size", {
                                                            valueAsNumber: true,
                                                        })}
                                                    />
                                                    {errors.max_team_size && (
                                                        <p className="text-sm text-destructive">
                                                            {errors.max_team_size.message}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Scoring type</Label>
                                                <Controller
                                                    control={control}
                                                    name="scoring_type"
                                                    render={({ field }) => (
                                                        <Select
                                                            value={field.value}
                                                            onValueChange={(value) =>
                                                                field.onChange(value)
                                                            }
                                                        >
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Select scoring" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem
                                                                    value={ScoringType.AUTO}
                                                                >
                                                                    Auto
                                                                </SelectItem>
                                                                <SelectItem
                                                                    value={ScoringType.MANUAL}
                                                                >
                                                                    Manual
                                                                </SelectItem>
                                                                <SelectItem
                                                                    value={ScoringType.HYBRID}
                                                                >
                                                                    Hybrid
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="rules">Rules</Label>
                                                <Textarea
                                                    id="rules"
                                                    placeholder="Optional contest rules or guidelines"
                                                    rows={6}
                                                    {...register("rules")}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="flex flex-col gap-6">
                                    <Card>
                                        <CardHeader className="space-y-1">
                                            <CardTitle>Contest Settings</CardTitle>
                                            <CardDescription>
                                                Configure access, evaluation, and participation
                                                behavior.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {initialData && (
                                                <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-muted/20 p-4">
                                                    <div className="space-y-1">
                                                        <Label
                                                            htmlFor="is_public"
                                                            className="font-semibold"
                                                        >
                                                            Public contest
                                                        </Label>
                                                        <p className="text-xs text-muted-foreground">
                                                            Allow users to discover this contest
                                                            without an invitation.
                                                        </p>
                                                    </div>
                                                    <Controller
                                                        control={control}
                                                        name="is_public"
                                                        render={({ field }) => (
                                                            <Switch
                                                                id="is_public"
                                                                checked={field.value ?? true}
                                                                onCheckedChange={field.onChange}
                                                                aria-label="Make contest public"
                                                            />
                                                        )}
                                                    />
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-muted/20 p-4">
                                                <div className="space-y-1">
                                                    <Label
                                                        htmlFor="show_leaderboard"
                                                        className="font-semibold"
                                                    >
                                                        Show leaderboard
                                                    </Label>
                                                    <p className="text-xs text-muted-foreground">
                                                        Display live rankings to participants during
                                                        the contest.
                                                    </p>
                                                </div>
                                                <Controller
                                                    control={control}
                                                    name="show_leaderboard_during_contest"
                                                    render={({ field }) => (
                                                        <Switch
                                                            id="show_leaderboard"
                                                            checked={field.value ?? true}
                                                            onCheckedChange={field.onChange}
                                                            aria-label="Show leaderboard during contest"
                                                        />
                                                    )}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-muted/20 p-4">
                                                <div className="space-y-1">
                                                    <Label
                                                        htmlFor="evaluate_on_submit"
                                                        className="font-semibold"
                                                    >
                                                        Evaluate on submission
                                                    </Label>
                                                    <p className="text-xs text-muted-foreground">
                                                        Evaluate immediately; turn off to evaluate
                                                        when the session finishes.
                                                    </p>
                                                </div>
                                                <Controller
                                                    control={control}
                                                    name="evaluate_on_submit"
                                                    render={({ field }) => (
                                                        <Switch
                                                            id="evaluate_on_submit"
                                                            checked={field.value ?? true}
                                                            onCheckedChange={field.onChange}
                                                            aria-label="Evaluate submissions immediately"
                                                        />
                                                    )}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-muted/20 p-4">
                                                <div className="space-y-1">
                                                    <Label
                                                        htmlFor="shuffle_questions"
                                                        className="font-semibold"
                                                    >
                                                        Shuffle questions
                                                    </Label>
                                                    <p className="text-xs text-muted-foreground">
                                                        Randomize the question order separately for
                                                        each participant.
                                                    </p>
                                                </div>
                                                <Controller
                                                    control={control}
                                                    name="shuffle_questions"
                                                    render={({ field }) => (
                                                        <Switch
                                                            id="shuffle_questions"
                                                            checked={field.value ?? false}
                                                            onCheckedChange={field.onChange}
                                                            aria-label="Shuffle questions for participants"
                                                        />
                                                    )}
                                                />
                                            </div>

                                            {contestMode === ContestMode.team && (
                                                <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-muted/20 p-4">
                                                    <div className="space-y-1">
                                                        <Label
                                                            htmlFor="team_approval"
                                                            className="font-semibold"
                                                        >
                                                            Require team approval
                                                        </Label>
                                                        <p className="text-xs text-muted-foreground">
                                                            Review team requests before allowing
                                                            them to participate.
                                                        </p>
                                                    </div>
                                                    <Controller
                                                        control={control}
                                                        name="team_approval_mode"
                                                        render={({ field }) => (
                                                            <Switch
                                                                id="team_approval"
                                                                checked={
                                                                    field.value ===
                                                                    TeamApprovalMode.INSTRUCTOR_REVIEW
                                                                }
                                                                onCheckedChange={(checked) =>
                                                                    field.onChange(
                                                                        checked
                                                                            ? TeamApprovalMode.INSTRUCTOR_REVIEW
                                                                            : TeamApprovalMode.AUTO_APPROVE,
                                                                    )
                                                                }
                                                                aria-label="Require instructor approval for teams"
                                                            />
                                                        )}
                                                    />
                                                </div>
                                            )}

                                            <div className="space-y-2">
                                                <Label htmlFor="max_submission_per_question">
                                                    Max Submissions per Question
                                                </Label>
                                                <Input
                                                    id="max_submission_per_question"
                                                    type="number"
                                                    min={1}
                                                    placeholder="No limit"
                                                    {...register("max_submission_per_question", {
                                                        setValueAs: (value) => {
                                                            if (value === "") return undefined;
                                                            const parsed = Number(value);
                                                            return Number.isFinite(parsed)
                                                                ? parsed
                                                                : undefined;
                                                        },
                                                    })}
                                                />
                                                {errors.max_submission_per_question && (
                                                    <p className="text-sm text-destructive">
                                                        {errors.max_submission_per_question.message}
                                                    </p>
                                                )}
                                                <p className="text-xs text-muted-foreground">
                                                    Limit the number of submissions allowed for each
                                                    question.
                                                </p>
                                            </div>

                                            <Separator />

                                            <div className="space-y-2">
                                                <Label>Contest image</Label>
                                                <Input
                                                    type="file"
                                                    accept="image/*"
                                                    disabled={uploadImageMutation.isPending}
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) void onPickImage(file);
                                                    }}
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    Upload a banner image (recommended 16:9). Stored
                                                    in object storage.
                                                </p>

                                                {uploadImageMutation.isPending && (
                                                    <p className="text-sm text-muted-foreground">
                                                        Uploading…
                                                    </p>
                                                )}

                                                {imageUrl ? (
                                                    <div className="space-y-2">
                                                        <div className="relative aspect-video w-full overflow-hidden rounded-md border bg-muted">
                                                            <Image
                                                                src={imageUrl}
                                                                alt="Contest image preview"
                                                                fill
                                                                sizes="(min-width: 1024px) 33vw, 100vw"
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                        <div className="flex items-center justify-between gap-3">
                                                            <p className="min-w-0 truncate text-xs text-muted-foreground">
                                                                {uploadedImage?.object_key ??
                                                                    imageUrl}
                                                            </p>
                                                            <div className="flex items-center gap-2">
                                                                <Dialog
                                                                    open={isImageViewerOpen}
                                                                    onOpenChange={
                                                                        setIsImageViewerOpen
                                                                    }
                                                                >
                                                                    <DialogTrigger asChild>
                                                                        <Button
                                                                            type="button"
                                                                            variant="outline"
                                                                        >
                                                                            View
                                                                        </Button>
                                                                    </DialogTrigger>
                                                                    <DialogContent className="sm:max-w-3xl">
                                                                        <DialogHeader>
                                                                            <DialogTitle>
                                                                                Contest Image
                                                                            </DialogTitle>
                                                                            <DialogDescription>
                                                                                Preview the uploaded
                                                                                banner.
                                                                            </DialogDescription>
                                                                        </DialogHeader>
                                                                        <div className="relative aspect-video w-full overflow-hidden rounded-md border bg-muted">
                                                                            <Image
                                                                                src={imageUrl}
                                                                                alt="Contest image"
                                                                                fill
                                                                                sizes="(min-width: 1024px) 768px, 100vw"
                                                                                className="object-contain"
                                                                            />
                                                                        </div>
                                                                    </DialogContent>
                                                                </Dialog>

                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    onClick={() => {
                                                                        setUploadedImage(null);
                                                                        setValue("image", null, {
                                                                            shouldDirty: true,
                                                                            shouldTouch: true,
                                                                        });
                                                                    }}
                                                                >
                                                                    Remove
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : null}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </TabsContent>

                        {initialData && contestId && (
                            <TabsContent value="access" className="m-0 space-y-6">
                                <Controller
                                    control={control}
                                    name="is_public"
                                    render={({ field }) => (
                                        <div className="grid gap-3 md:grid-cols-2">
                                            <button
                                                type="button"
                                                onClick={() => field.onChange(true)}
                                                className={`flex items-start gap-4 rounded-xl border p-5 text-left transition-all ${
                                                    field.value
                                                        ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                                                        : "border-border/60 bg-card hover:border-primary/30 hover:bg-primary/5"
                                                }`}
                                            >
                                                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                    <Globe2 className="size-5" />
                                                </span>
                                                <span>
                                                    <span className="block font-semibold">
                                                        Public
                                                    </span>
                                                    <span className="mt-1 block text-sm text-muted-foreground">
                                                        Anyone can discover and register for this
                                                        contest.
                                                    </span>
                                                </span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => field.onChange(false)}
                                                className={`flex items-start gap-4 rounded-xl border p-5 text-left transition-all ${
                                                    !field.value
                                                        ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                                                        : "border-border/60 bg-card hover:border-primary/30 hover:bg-primary/5"
                                                }`}
                                            >
                                                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-contrast/15 text-contrast">
                                                    <LockKeyhole className="size-5" />
                                                </span>
                                                <span>
                                                    <span className="block font-semibold">
                                                        Private
                                                    </span>
                                                    <span className="mt-1 block text-sm text-muted-foreground">
                                                        Only selected audience members can
                                                        participate.
                                                    </span>
                                                </span>
                                            </button>
                                        </div>
                                    )}
                                />
                                {!isPublic && <AudiencesSection contestId={contestId} />}
                            </TabsContent>
                        )}

                        {initialData && contestId && (
                            <TabsContent value="instructors" className="m-0">
                                <InstructorsSection contestId={contestId} />
                            </TabsContent>
                        )}

                        {!initialData && (
                            <TabsContent value="access" className="m-0 space-y-6">
                                <Card className="overflow-visible border-0 bg-transparent shadow-none">
                                    <CardHeader className="hidden">
                                        <CardTitle>Participant Access</CardTitle>
                                        <CardDescription>
                                            Choose who can discover and participate in this contest.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6 p-6">
                                        <div className="space-y-3">
                                            <div>
                                                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                                                    Visibility mode
                                                </h3>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    Private contests are limited to selected
                                                    audiences.
                                                </p>
                                            </div>
                                            <Controller
                                                control={control}
                                                name="is_public"
                                                render={({ field }) => (
                                                    <div className="grid gap-3 md:grid-cols-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => field.onChange(true)}
                                                            className={`flex items-start gap-4 rounded-xl border p-5 text-left transition-all ${
                                                                field.value
                                                                    ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                                                                    : "border-border/60 bg-card hover:border-primary/30 hover:bg-primary/5"
                                                            }`}
                                                        >
                                                            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                                <Globe2 className="size-5" />
                                                            </span>
                                                            <span>
                                                                <span className="block font-semibold">
                                                                    Public
                                                                </span>
                                                                <span className="mt-1 block text-sm text-muted-foreground">
                                                                    Anyone can discover and register
                                                                    for this contest.
                                                                </span>
                                                            </span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => field.onChange(false)}
                                                            className={`flex items-start gap-4 rounded-xl border p-5 text-left transition-all ${
                                                                !field.value
                                                                    ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                                                                    : "border-border/60 bg-card hover:border-primary/30 hover:bg-primary/5"
                                                            }`}
                                                        >
                                                            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-contrast/15 text-contrast">
                                                                <LockKeyhole className="size-5" />
                                                            </span>
                                                            <span>
                                                                <span className="block font-semibold">
                                                                    Private
                                                                </span>
                                                                <span className="mt-1 block text-sm text-muted-foreground">
                                                                    Only members of selected
                                                                    audiences can participate.
                                                                </span>
                                                            </span>
                                                        </button>
                                                    </div>
                                                )}
                                            />
                                        </div>

                                        {!isPublic && (
                                            <div className="grid gap-6 lg:grid-cols-2">
                                                <Controller
                                                    control={control}
                                                    name="audience_ids"
                                                    render={({ field }) => {
                                                        const selectedIds = field.value ?? [];
                                                        return (
                                                            <>
                                                                <div className="flex min-h-[430px] flex-col gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
                                                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                                        <div>
                                                                            <div className="flex items-center gap-2">
                                                                                <h3 className="font-semibold">
                                                                                    Available
                                                                                    Audiences
                                                                                </h3>
                                                                                <Badge variant="secondary">
                                                                                    {
                                                                                        selectedIds.length
                                                                                    }
                                                                                </Badge>
                                                                            </div>
                                                                            <p className="mt-1 text-sm text-muted-foreground">
                                                                                Select the classes
                                                                                or batches allowed
                                                                                to participate.
                                                                            </p>
                                                                        </div>
                                                                        <div className="relative w-full sm:w-72">
                                                                            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                                                            <Input
                                                                                value={
                                                                                    audienceSearch
                                                                                }
                                                                                onChange={(event) =>
                                                                                    setAudienceSearch(
                                                                                        event.target
                                                                                            .value,
                                                                                    )
                                                                                }
                                                                                placeholder="Search audiences..."
                                                                                className="bg-background pl-9"
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    <div className="grid gap-3 md:grid-cols-2">
                                                                        {availableAudiences.map(
                                                                            (audience) => {
                                                                                const selected =
                                                                                    selectedIds.includes(
                                                                                        audience.id,
                                                                                    );
                                                                                return (
                                                                                    <button
                                                                                        key={
                                                                                            audience.id
                                                                                        }
                                                                                        type="button"
                                                                                        onClick={() => {
                                                                                            field.onChange(
                                                                                                selected
                                                                                                    ? selectedIds.filter(
                                                                                                          (
                                                                                                              id,
                                                                                                          ) =>
                                                                                                              id !==
                                                                                                              audience.id,
                                                                                                      )
                                                                                                    : [
                                                                                                          ...selectedIds,
                                                                                                          audience.id,
                                                                                                      ],
                                                                                            );
                                                                                            setSelectedAudiences(
                                                                                                (
                                                                                                    current,
                                                                                                ) =>
                                                                                                    selected
                                                                                                        ? current.filter(
                                                                                                              (
                                                                                                                  item,
                                                                                                              ) =>
                                                                                                                  item.id !==
                                                                                                                  audience.id,
                                                                                                          )
                                                                                                        : [
                                                                                                              ...current,
                                                                                                              audience,
                                                                                                          ],
                                                                                            );
                                                                                        }}
                                                                                        className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                                                                                            selected
                                                                                                ? "border-primary/50 bg-primary/10"
                                                                                                : "border-border/50 bg-background hover:border-primary/30"
                                                                                        }`}
                                                                                    >
                                                                                        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                                                            <School className="size-5" />
                                                                                        </span>
                                                                                        <span className="min-w-0 flex-1">
                                                                                            <span className="block truncate text-sm font-semibold">
                                                                                                {
                                                                                                    audience.name
                                                                                                }
                                                                                            </span>
                                                                                            <span className="mt-1 block text-xs text-muted-foreground">
                                                                                                {
                                                                                                    audience.type
                                                                                                }
                                                                                            </span>
                                                                                        </span>
                                                                                        {selected && (
                                                                                            <Badge>
                                                                                                Allowed
                                                                                            </Badge>
                                                                                        )}
                                                                                    </button>
                                                                                );
                                                                            },
                                                                        )}
                                                                    </div>

                                                                    {errors.audience_ids && (
                                                                        <p className="text-sm font-medium text-destructive">
                                                                            {
                                                                                errors.audience_ids
                                                                                    .message
                                                                            }
                                                                        </p>
                                                                    )}

                                                                    {isLoadingAudiences && (
                                                                        <p className="py-8 text-center text-sm text-muted-foreground">
                                                                            Loading audiences…
                                                                        </p>
                                                                    )}
                                                                    {!isLoadingAudiences &&
                                                                        availableAudiences.length ===
                                                                            0 && (
                                                                            <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                                                                                No audiences found.
                                                                            </div>
                                                                        )}
                                                                </div>

                                                                <div className="flex min-h-[430px] flex-col rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
                                                                    <div className="flex items-start justify-between gap-3 border-b border-border/50 pb-4">
                                                                        <div>
                                                                            <h3 className="font-semibold">
                                                                                Restricted To
                                                                            </h3>
                                                                            <p className="mt-1 text-sm text-muted-foreground">
                                                                                Only these audience
                                                                                members can
                                                                                participate.
                                                                            </p>
                                                                        </div>
                                                                        <Badge variant="secondary">
                                                                            {
                                                                                selectedAudiences.length
                                                                            }
                                                                        </Badge>
                                                                    </div>
                                                                    <div className="mt-4 space-y-3">
                                                                        {selectedAudiences.length >
                                                                        0 ? (
                                                                            selectedAudiences.map(
                                                                                (audience) => (
                                                                                    <div
                                                                                        key={
                                                                                            audience.id
                                                                                        }
                                                                                        className="flex items-center gap-3 rounded-xl border border-primary/15 bg-primary/5 p-4"
                                                                                    >
                                                                                        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-contrast/15 text-contrast">
                                                                                            <School className="size-5" />
                                                                                        </span>
                                                                                        <span className="min-w-0 flex-1">
                                                                                            <span className="block truncate text-sm font-semibold">
                                                                                                {
                                                                                                    audience.name
                                                                                                }
                                                                                            </span>
                                                                                            <span className="text-xs text-muted-foreground">
                                                                                                {
                                                                                                    audience.type
                                                                                                }
                                                                                            </span>
                                                                                        </span>
                                                                                        <Button
                                                                                            type="button"
                                                                                            variant="ghost"
                                                                                            size="icon"
                                                                                            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                                                                            onClick={() => {
                                                                                                field.onChange(
                                                                                                    selectedIds.filter(
                                                                                                        (
                                                                                                            id,
                                                                                                        ) =>
                                                                                                            id !==
                                                                                                            audience.id,
                                                                                                    ),
                                                                                                );
                                                                                                setSelectedAudiences(
                                                                                                    (
                                                                                                        current,
                                                                                                    ) =>
                                                                                                        current.filter(
                                                                                                            (
                                                                                                                item,
                                                                                                            ) =>
                                                                                                                item.id !==
                                                                                                                audience.id,
                                                                                                        ),
                                                                                                );
                                                                                            }}
                                                                                            aria-label={`Remove ${audience.name}`}
                                                                                        >
                                                                                            <X className="size-4" />
                                                                                        </Button>
                                                                                    </div>
                                                                                ),
                                                                            )
                                                                        ) : (
                                                                            <div className="flex flex-1 flex-col items-center justify-center py-24 text-center text-muted-foreground">
                                                                                <Users className="mb-3 size-8 opacity-30" />
                                                                                <p className="text-sm font-medium">
                                                                                    No audience
                                                                                    restrictions yet
                                                                                </p>
                                                                                <p className="mt-1 max-w-xs text-xs">
                                                                                    Add an audience
                                                                                    from the left to
                                                                                    restrict
                                                                                    participation.
                                                                                </p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </>
                                                        );
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        )}

                        {!initialData && (
                            <TabsContent value="instructors" className="m-0 space-y-6">
                                <Card className="overflow-visible border-0 bg-transparent py-0 shadow-none">
                                    <CardHeader className="hidden">
                                        <CardTitle>Contest Instructors</CardTitle>
                                        <CardDescription>
                                            Add instructors who can manage this contest after it is
                                            created.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="grid gap-6 p-0 lg:grid-cols-2">
                                        <div className="relative min-h-[500px] w-full space-y-5 rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
                                            <div>
                                                <h3 className="flex items-center gap-2 font-semibold">
                                                    <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                        <UserPlus className="size-4" />
                                                    </span>
                                                    Add Instructors
                                                </h3>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    Search by name or institutional email.
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="relative min-w-0 max-w-2xl flex-1">
                                                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                                    <Input
                                                        value={instructorSearch}
                                                        onChange={(event) =>
                                                            setInstructorSearch(event.target.value)
                                                        }
                                                        placeholder="Search instructors..."
                                                        className="bg-background pl-9"
                                                    />
                                                </div>
                                            </div>

                                            <Controller
                                                control={control}
                                                name="instructor_ids"
                                                render={({ field }) => {
                                                    const selectedIds = field.value ?? [];
                                                    return (
                                                        <div className="min-h-[340px] space-y-2 overflow-y-auto rounded-xl border border-border/50 bg-muted/15 p-3">
                                                            {isLoadingInstructorSearch && (
                                                                <p className="py-10 text-center text-sm text-muted-foreground">
                                                                    Searching instructors…
                                                                </p>
                                                            )}
                                                            {!isLoadingInstructorSearch &&
                                                                instructorSearch.length < 2 && (
                                                                    <div className="flex min-h-56 flex-col items-center justify-center text-center text-muted-foreground">
                                                                        <Search className="mb-3 size-7 opacity-40" />
                                                                        <p className="text-sm">
                                                                            Enter at least two
                                                                            characters to search.
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            {!isLoadingInstructorSearch &&
                                                                instructorSearch.length >= 2 &&
                                                                availableInstructors.map(
                                                                    (instructor) => {
                                                                        const selected =
                                                                            selectedIds.includes(
                                                                                instructor.id,
                                                                            );
                                                                        return (
                                                                            <div
                                                                                key={instructor.id}
                                                                                className="flex items-center gap-3 rounded-xl border border-border/50 bg-background p-3"
                                                                            >
                                                                                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                                                                                    {instructor.name
                                                                                        .split(" ")
                                                                                        .map(
                                                                                            (
                                                                                                part,
                                                                                            ) =>
                                                                                                part[0],
                                                                                        )
                                                                                        .join("")
                                                                                        .slice(0, 2)
                                                                                        .toUpperCase()}
                                                                                </span>
                                                                                <span className="min-w-0 flex-1">
                                                                                    <span className="block truncate text-sm font-semibold">
                                                                                        {
                                                                                            instructor.name
                                                                                        }
                                                                                    </span>
                                                                                    <span className="block truncate text-xs text-muted-foreground">
                                                                                        {
                                                                                            instructor.email
                                                                                        }
                                                                                    </span>
                                                                                </span>
                                                                                <Button
                                                                                    type="button"
                                                                                    size="sm"
                                                                                    variant={
                                                                                        selected
                                                                                            ? "secondary"
                                                                                            : "default"
                                                                                    }
                                                                                    disabled={
                                                                                        selected
                                                                                    }
                                                                                    onClick={() => {
                                                                                        field.onChange(
                                                                                            [
                                                                                                ...selectedIds,
                                                                                                instructor.id,
                                                                                            ],
                                                                                        );
                                                                                        setSelectedInstructors(
                                                                                            (
                                                                                                current,
                                                                                            ) => [
                                                                                                ...current,
                                                                                                instructor,
                                                                                            ],
                                                                                        );
                                                                                    }}
                                                                                >
                                                                                    {selected ? (
                                                                                        "Added"
                                                                                    ) : (
                                                                                        <>
                                                                                            <UserPlus className="size-3.5" />
                                                                                            Add
                                                                                        </>
                                                                                    )}
                                                                                </Button>
                                                                            </div>
                                                                        );
                                                                    },
                                                                )}
                                                            {!isLoadingInstructorSearch &&
                                                                instructorSearch.length >= 2 &&
                                                                availableInstructors.length ===
                                                                    0 && (
                                                                    <p className="py-10 text-center text-sm text-muted-foreground">
                                                                        No instructors found.
                                                                    </p>
                                                                )}
                                                        </div>
                                                    );
                                                }}
                                            />
                                        </div>

                                        <Controller
                                            control={control}
                                            name="instructor_ids"
                                            render={({ field }) => (
                                                <div className="min-h-[500px] space-y-5 rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
                                                    <div className="flex items-start justify-between gap-3 border-b border-border/50 pb-4">
                                                        <div>
                                                            <h3 className="flex items-center gap-2 font-semibold">
                                                                <span className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                                                                    <UserCog className="size-4" />
                                                                </span>
                                                                Current Instructors
                                                            </h3>
                                                            <p className="mt-1 text-sm text-muted-foreground">
                                                                Users who will manage this contest.
                                                            </p>
                                                        </div>
                                                        <Badge variant="secondary">
                                                            {selectedInstructors.length}
                                                        </Badge>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {selectedInstructors.length > 0 ? (
                                                            selectedInstructors.map(
                                                                (instructor) => (
                                                                    <div
                                                                        key={instructor.id}
                                                                        className="flex items-center gap-3 rounded-xl border border-primary/15 bg-primary/5 p-3"
                                                                    >
                                                                        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-contrast/15 text-contrast">
                                                                            <UserCog className="size-5" />
                                                                        </span>
                                                                        <span className="min-w-0 flex-1">
                                                                            <span className="block truncate text-sm font-semibold">
                                                                                {instructor.name}
                                                                            </span>
                                                                            <span className="block truncate text-xs text-muted-foreground">
                                                                                {instructor.email}
                                                                            </span>
                                                                        </span>
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                                                            aria-label={`Remove ${instructor.name}`}
                                                                            onClick={() => {
                                                                                field.onChange(
                                                                                    (
                                                                                        field.value ??
                                                                                        []
                                                                                    ).filter(
                                                                                        (id) =>
                                                                                            id !==
                                                                                            instructor.id,
                                                                                    ),
                                                                                );
                                                                                setSelectedInstructors(
                                                                                    (current) =>
                                                                                        current.filter(
                                                                                            (
                                                                                                item,
                                                                                            ) =>
                                                                                                item.id !==
                                                                                                instructor.id,
                                                                                        ),
                                                                                );
                                                                            }}
                                                                        >
                                                                            <X className="size-4" />
                                                                        </Button>
                                                                    </div>
                                                                ),
                                                            )
                                                        ) : (
                                                            <div className="flex min-h-[340px] flex-col items-center justify-center text-center text-muted-foreground">
                                                                <UserCog className="mb-3 size-8 opacity-30" />
                                                                <p className="text-sm font-medium">
                                                                    No instructors selected
                                                                </p>
                                                                <p className="mt-1 text-xs">
                                                                    This step is optional.
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        />
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        )}
                    </Tabs>
                </Card>
            </form>
        </>
    );
}
