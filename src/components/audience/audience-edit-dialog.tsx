"use client";

import { useEffect, useMemo } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import type { AudienceResponse } from "@/api/generated/model";
import { AudienceType } from "@/api/generated/model";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/lib/hooks/use-toast";
import { toApiError } from "@/lib/api/error";
import { useUpdateAudience } from "@/query/audience-query";

const formSchema = z.object({
    name: z.string().min(1, "Audience name is required").max(255),
    audience_type: z.enum([
        AudienceType.class,
        AudienceType.department,
        AudienceType.batch,
        AudienceType.campus,
    ]),
    description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

function formatAudienceType(value: string) {
    return value.replaceAll("_", " ").replaceAll("-", " ");
}

type AudienceEditDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    audienceId: string;
    audience?: AudienceResponse | null;
};

export function AudienceEditDialog({
    open,
    onOpenChange,
    audienceId,
    audience,
}: AudienceEditDialogProps) {
    const updateMutation = useUpdateAudience();

    const initialValues = useMemo<FormValues | null>(() => {
        if (!audience) return null;
        return {
            name: audience.name ?? "",
            audience_type:
                (audience.audience_type as FormValues["audience_type"]) ?? AudienceType.class,
            description: audience.description ?? "",
        };
    }, [audience]);

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors, isDirty, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            audience_type: AudienceType.class,
            description: "",
        },
        mode: "onTouched",
    });

    useEffect(() => {
        if (!open) return;
        if (initialValues) reset(initialValues);
    }, [initialValues, open, reset]);

    const onSubmit = handleSubmit(async (values) => {
        try {
            await updateMutation.mutateAsync({
                audienceId,
                payload: {
                    name: values.name.trim(),
                    audience_type: values.audience_type,
                    description: values.description?.trim() ? values.description.trim() : null,
                },
            });
            toast("Audience updated");
            onOpenChange(false);
        } catch (error) {
            const apiError = toApiError(error);
            toast(apiError.detail ?? apiError.message ?? "Failed to update audience");
        }
    });

    const isPending = isSubmitting || updateMutation.isPending;
    const canSubmit = !!audience && isDirty && !isPending;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Edit audience</DialogTitle>
                    <DialogDescription>
                        Update name, type, and description. Changes apply immediately.
                    </DialogDescription>
                </DialogHeader>

                {!audience ? (
                    <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                        Audience details are not available yet.
                    </div>
                ) : (
                    <form onSubmit={onSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="audience_name">Name</Label>
                                <Input
                                    id="audience_name"
                                    placeholder="e.g. CSE 2026 - Batch A"
                                    {...register("name")}
                                />
                                {errors.name ? (
                                    <p className="text-sm text-destructive">
                                        {errors.name.message}
                                    </p>
                                ) : null}
                            </div>

                            <div className="space-y-2">
                                <Label>Audience type</Label>
                                <Controller
                                    control={control}
                                    name="audience_type"
                                    render={({ field }) => (
                                        <Select
                                            value={field.value}
                                            onValueChange={(value) => field.onChange(value)}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value={AudienceType.class}>
                                                    {formatAudienceType(AudienceType.class)}
                                                </SelectItem>
                                                <SelectItem value={AudienceType.department}>
                                                    {formatAudienceType(AudienceType.department)}
                                                </SelectItem>
                                                <SelectItem value={AudienceType.batch}>
                                                    {formatAudienceType(AudienceType.batch)}
                                                </SelectItem>
                                                <SelectItem value={AudienceType.campus}>
                                                    {formatAudienceType(AudienceType.campus)}
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="audience_description">Description</Label>
                            <Textarea
                                id="audience_description"
                                rows={4}
                                placeholder="Optional context for admins and instructors"
                                {...register("description")}
                            />
                        </div>

                        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => initialValues && reset(initialValues)}
                                disabled={isPending || !isDirty}
                            >
                                Reset
                            </Button>
                            <Button type="submit" disabled={!canSubmit}>
                                {updateMutation.isPending ? "Saving…" : "Save changes"}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
