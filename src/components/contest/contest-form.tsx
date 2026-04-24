import {
    ContestDetailResponse,
    ImageUploadResponse,
    ScoringType,
    TeamApprovalMode,
    ContestMode,
} from "@/api/generated/model";
import { useUploadContestImage } from "@/query/contest-query";
import { useMemo, useState, useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toDateTimeLocalValue } from "@/lib/utils/date-time-parser";
import { AudienceSelectorCard } from "./audience-selector-card";
import {
    Dialog,
    DialogHeader,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import Image from "next/image";
import { ContestActionBar } from "./contest-action-bar";
import { ContestSummaryCard } from "./contest-summary-card";
import { toApiError } from "@/lib/api/error";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { toast } from "@/lib/hooks/use-toast";
import { contestFormSchema, ContestFormValues } from "./form/contest-form";

type ContestFormProps = {
    onSubmit: (data: ContestFormValues) => Promise<void>;
    contest?: ContestDetailResponse | null;
    audience_ids?: string[] | null;
    isPending: boolean;
};

export function ContestForm({ onSubmit, contest, audience_ids, isPending }: ContestFormProps) {
    const router = useRouter();

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
    } = useForm<ContestFormValues>({
        resolver: zodResolver(contestFormSchema),
        defaultValues: {
            name: contest ? contest.name : "",
            description: contest ? contest.description?.toString() : "",
            image: contest ? contest.image : null,
            is_public: contest ? contest.is_public : true,
            start_time: contest
                ? toDateTimeLocalValue(new Date(contest.start_time))
                : toDateTimeLocalValue(now.start),
            end_time: contest
                ? toDateTimeLocalValue(new Date(contest.end_time))
                : toDateTimeLocalValue(now.end),
            registration_start: contest
                ? toDateTimeLocalValue(new Date(contest.registration_start!))
                : "",
            registration_end: contest
                ? toDateTimeLocalValue(new Date(contest.registration_end!))
                : "",
            mode: contest ? contest.mode : ContestMode.team,
            max_teams: contest ? (contest.max_teams ?? undefined) : undefined,
            min_team_size: contest ? contest.min_team_size : 1,
            max_team_size: contest ? contest.max_team_size : 3,
            rules: contest ? (contest.rules ?? "") : "",
            scoring_type: contest ? contest.scoring_type : ScoringType.AUTO,
            team_approval_mode: contest
                ? contest.team_approval_mode
                : TeamApprovalMode.AUTO_APPROVE,
            audience_ids: audience_ids ? audience_ids : [],
        },
        mode: "onTouched",
    });

    const imageUrl = useWatch({ control, name: "image" }) ?? null;
    const watchedName = useWatch({ control, name: "name" }) ?? "";
    const watchedIsPublic = useWatch({ control, name: "is_public" });
    const watchedStartTime = useWatch({ control, name: "start_time" });
    const watchedEndTime = useWatch({ control, name: "end_time" });
    const watchedAudienceIds = useWatch({ control, name: "audience_ids" }) ?? [];
    const watchedMode = useWatch({ control, name: "mode" });

    useEffect(() => {
        if (watchedMode === ContestMode.individual) {
            setValue("min_team_size", 1);
            setValue("max_team_size", 1);
        }
    }, [watchedMode, setValue]);

    const [uploadedImage, setUploadedImage] = useState<ImageUploadResponse | null>(null);
    const uploadImageMutation = useUploadContestImage();
    const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);

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

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="grid grid-cols-1 gap-6 lg:grid-cols-3"
            >
                <div className="lg:col-span-3">
                    <ContestActionBar
                        isSubmitting={isSubmitting}
                        isPending={isPending}
                        isUploadingImage={uploadImageMutation.isPending}
                        onCancel={() => router.push("/contest")}
                        isUpdate={!!contest}
                    />
                </div>

                <Card className="lg:col-span-2">
                    <CardHeader className="space-y-1">
                        <CardTitle>Contest Details</CardTitle>
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
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Mode</Label>
                                    <Controller
                                        control={control}
                                        name="mode"
                                        render={({ field }) => (
                                            <Select
                                                value={field.value}
                                                onValueChange={(value) => field.onChange(value)}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select mode" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value={ContestMode.team}>
                                                        Team
                                                    </SelectItem>
                                                    <SelectItem value={ContestMode.individual}>
                                                        Individual
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
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
                                        disabled={watchedMode === ContestMode.individual}
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
                                        disabled={watchedMode === ContestMode.individual}
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

                <div className="flex flex-col gap-6 lg:sticky lg:top-8 lg:self-start">
                    <ContestSummaryCard
                        name={watchedName}
                        isPublic={watchedIsPublic !== false}
                        startTime={watchedStartTime}
                        endTime={watchedEndTime}
                        audienceCount={watchedAudienceIds.length}
                    />

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

                    {!contest && <AudienceSelectorCard control={control} name="audience_ids" />}
                </div>
            </form>
        </>
    );
}
