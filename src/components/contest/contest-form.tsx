// @ts-nocheck
"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import type { ContestCreate, ContestUpdate, ContestDetailResponse } from "@/api/generated/model";
import { ScoringType, TeamApprovalMode } from "@/api/generated/model";
import type { ImageUploadResponse } from "@/api/generated/model";
import {
    useCreateContest,
    useUpdateContest,
    useUploadContestImage,
    contestKeys,
} from "@/query/contest-query";
import { toApiError } from "@/lib/api/error";
import { toast } from "@/lib/hooks/use-toast";

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
        max_teams: z.number().int().min(1).optional(),
        min_team_size: z.number().int().min(1).optional(),
        max_team_size: z.number().int().min(1).optional(),
        rules: z.string().optional(),
        scoring_type: z.enum([ScoringType.AUTO, ScoringType.MANUAL, ScoringType.HYBRID]).optional(),
        team_approval_mode: z
            .enum([TeamApprovalMode.AUTO_APPROVE, TeamApprovalMode.INSTRUCTOR_REVIEW])
            .optional(),
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
    const queryClient = useQueryClient();

    const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
    const [errorDialogTitle, setErrorDialogTitle] = useState("Request failed");
    const [errorDialogMessage, setErrorDialogMessage] = useState<string>("Something went wrong.");
    const [errorDialogStatus, setErrorDialogStatus] = useState<number | undefined>(undefined);

    function openErrorDialog(error: unknown, title?: string) {
        const apiError = toApiError(error);
        setErrorDialogTitle(title ?? "Request failed");
        setErrorDialogMessage(apiError.detail ?? apiError.message);
        setErrorDialogStatus(apiError.status);
        setIsErrorDialogOpen(true);
    }

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
        setValue,
        formState: { errors, isSubmitting },
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
            max_teams: initialData?.max_teams ?? undefined,
            min_team_size: initialData?.min_team_size ?? 1,
            max_team_size: initialData?.max_team_size ?? 3,
            rules: initialData?.rules ?? "",
            scoring_type: initialData?.scoring_type ?? ScoringType.AUTO,
            team_approval_mode: initialData?.team_approval_mode ?? TeamApprovalMode.AUTO_APPROVE,
        },
        mode: "onTouched",
    });

    const imageUrl = useWatch({ control, name: "image" }) ?? null;

    const [uploadedImage, setUploadedImage] = useState<ImageUploadResponse | null>(null);
    const uploadImageMutation = useUploadContestImage();
    const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);

    const createContestMutation = useCreateContest();
    const updateContestMutation = useUpdateContest();
    const isPending = createContestMutation.isPending || updateContestMutation.isPending;

    async function onPickImage(file: File) {
        try {
            const result = await uploadImageMutation.mutateAsync(file);
            setUploadedImage(result);
            setValue("image", result.url, { shouldDirty: true, shouldTouch: true });
            toast.success("Image uploaded");
        } catch (error) {
            openErrorDialog(error, "Image upload failed");
        }
    }

    const onSubmit = handleSubmit(async (values) => {
        const payload: ContestCreate | ContestUpdate = {
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
            max_teams: Number.isFinite(values.max_teams ?? NaN) ? values.max_teams! : null,
            min_team_size: values.min_team_size,
            max_team_size: values.max_team_size,
            rules: values.rules?.trim() ? values.rules.trim() : null,
            scoring_type: values.scoring_type,
            team_approval_mode: values.team_approval_mode,
        };

        try {
            if (initialData && contestId) {
                await updateContestMutation.mutateAsync({
                    contestId,
                    data: payload as ContestUpdate,
                });
                toast.success("Contest updated");
            } else {
                await createContestMutation.mutateAsync({ data: payload as ContestCreate });
                toast.success("Contest created");
            }
            queryClient.invalidateQueries({
                queryKey: contestKeys(),
            });
            router.push("/contest");
            router.refresh();
        } catch (error) {
            openErrorDialog(
                error,
                initialData ? "Failed to update contest" : "Failed to create contest",
            );
        }
    });

    return (
        <>
            <Dialog open={isErrorDialogOpen} onOpenChange={setIsErrorDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{errorDialogTitle}</DialogTitle>
                        <DialogDescription>
                            {errorDialogStatus ? `Status: ${errorDialogStatus}` : ""}
                        </DialogDescription>
                    </DialogHeader>
                    <Alert variant="destructive">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                            <p>{errorDialogMessage}</p>
                        </AlertDescription>
                    </Alert>
                    <div className="flex justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsErrorDialogOpen(false)}
                        >
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <form onSubmit={onSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader className="space-y-1">
                        <CardTitle>
                            {initialData ? "Edit Contest Details" : "Contest Details"}
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
                                    Times are entered in your local timezone and saved as UTC.
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
                                    <Label htmlFor="registration_start">Registration start</Label>
                                    <Input
                                        id="registration_start"
                                        type="datetime-local"
                                        {...register("registration_start")}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="registration_end">Registration end</Label>
                                    <Input
                                        id="registration_end"
                                        type="datetime-local"
                                        {...register("registration_end")}
                                    />
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-semibold">Participation</h3>
                                <p className="text-sm text-muted-foreground">
                                    Limits and team settings for this contest.
                                </p>
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
                                                return Number.isFinite(parsed) ? parsed : undefined;
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
                                    <Label htmlFor="min_team_size">Min team size</Label>
                                    <Input
                                        id="min_team_size"
                                        type="number"
                                        min={1}
                                        {...register("min_team_size", { valueAsNumber: true })}
                                    />
                                    {errors.min_team_size && (
                                        <p className="text-sm text-destructive">
                                            {errors.min_team_size.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="max_team_size">Max team size</Label>
                                    <Input
                                        id="max_team_size"
                                        type="number"
                                        min={1}
                                        {...register("max_team_size", { valueAsNumber: true })}
                                    />
                                    {errors.max_team_size && (
                                        <p className="text-sm text-destructive">
                                            {errors.max_team_size.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Scoring type</Label>
                                    <Controller
                                        control={control}
                                        name="scoring_type"
                                        render={({ field }) => (
                                            <Select
                                                value={field.value}
                                                onValueChange={(value) => field.onChange(value)}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select scoring" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value={ScoringType.AUTO}>
                                                        Auto
                                                    </SelectItem>
                                                    <SelectItem value={ScoringType.MANUAL}>
                                                        Manual
                                                    </SelectItem>
                                                    <SelectItem value={ScoringType.HYBRID}>
                                                        Hybrid
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Team approval</Label>
                                    <Controller
                                        control={control}
                                        name="team_approval_mode"
                                        render={({ field }) => (
                                            <Select
                                                value={field.value}
                                                onValueChange={(value) => field.onChange(value)}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select approval" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem
                                                        value={TeamApprovalMode.AUTO_APPROVE}
                                                    >
                                                        Auto approve
                                                    </SelectItem>
                                                    <SelectItem
                                                        value={TeamApprovalMode.INSTRUCTOR_REVIEW}
                                                    >
                                                        Instructor review
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
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
                            <CardTitle>Visibility</CardTitle>
                            <CardDescription>Control who can discover the contest.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Public</Label>
                                <Controller
                                    control={control}
                                    name="is_public"
                                    render={({ field }) => (
                                        <Select
                                            value={String(field.value ?? true)}
                                            onValueChange={(value) =>
                                                field.onChange(value === "true")
                                            }
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="true">Public</SelectItem>
                                                <SelectItem value="false">Private</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
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
                                    Upload a banner image (recommended 16:9). Stored in object
                                    storage.
                                </p>

                                {uploadImageMutation.isPending && (
                                    <p className="text-sm text-muted-foreground">Uploading…</p>
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
                                                {uploadedImage?.object_key ?? imageUrl}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <Dialog
                                                    open={isImageViewerOpen}
                                                    onOpenChange={setIsImageViewerOpen}
                                                >
                                                    <DialogTrigger asChild>
                                                        <Button type="button" variant="outline">
                                                            View
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="sm:max-w-3xl">
                                                        <DialogHeader>
                                                            <DialogTitle>Contest Image</DialogTitle>
                                                            <DialogDescription>
                                                                Preview the uploaded banner.
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

                    <Card>
                        <CardHeader className="space-y-1">
                            <CardTitle>{initialData ? "Save" : "Create"}</CardTitle>
                            <CardDescription>Review and submit when ready.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={
                                    isSubmitting || isPending || uploadImageMutation.isPending
                                }
                            >
                                {isPending
                                    ? initialData
                                        ? "Saving…"
                                        : "Creating…"
                                    : initialData
                                      ? "Save changes"
                                      : "Create contest"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => router.push("/contest")}
                            >
                                Cancel
                            </Button>
                            {createContestMutation.isError || updateContestMutation.isError ? (
                                <p className="text-sm text-destructive">
                                    {initialData
                                        ? "Update failed. Try again."
                                        : "Creation failed. Try again."}
                                </p>
                            ) : null}
                        </CardContent>
                    </Card>
                </div>
            </form>
        </>
    );
}
