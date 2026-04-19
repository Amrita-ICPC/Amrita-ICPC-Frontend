"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { AudienceType, type AudienceCreate } from "@/api/generated/model";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toApiError } from "@/lib/api/error";
import { useCreateAudience } from "@/query/audience-query";

/**
 * CreateAudienceDialog provides an admin-facing form to create a new Audience.
 *
 * UX requirements:
 * - Opens as a dialog.
 * - Shows clear loading, error, and success states within the dialog.
 * - Uses shadcn components only.
 */
export function CreateAudienceDialog(props: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    return (
        <Dialog open={props.open} onOpenChange={props.onOpenChange}>
            {props.open ? (
                <CreateAudienceDialogContent onClose={() => props.onOpenChange(false)} />
            ) : null}
        </Dialog>
    );
}

function CreateAudienceDialogContent(props: { onClose: () => void }) {
    const createAudienceMutation = useCreateAudience();

    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [errorStatus, setErrorStatus] = useState<number | undefined>(undefined);

    const audienceTypeOptions = useMemo(
        () => [
            AudienceType.class,
            AudienceType.department,
            AudienceType.batch,
            AudienceType.campus,
        ],
        [],
    );

    const formSchema = useMemo(
        () =>
            z.object({
                name: z.string().min(1, "Name is required").max(255),
                audience_type: z.enum([
                    AudienceType.class,
                    AudienceType.department,
                    AudienceType.batch,
                    AudienceType.campus,
                ]),
                description: z.string().optional(),
            }),
        [],
    );

    type FormValues = z.infer<typeof formSchema>;

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            audience_type: AudienceType.class,
            description: "",
        },
        mode: "onTouched",
    });

    const onSubmit = handleSubmit(async (values) => {
        setSuccessMessage(null);
        setErrorMessage(null);
        setErrorStatus(undefined);

        const payload: AudienceCreate = {
            name: values.name.trim(),
            audience_type: values.audience_type,
            description: values.description?.trim() ? values.description.trim() : null,
        };

        try {
            const response = await createAudienceMutation.mutateAsync(payload);
            setSuccessMessage(response.message ?? "Audience created successfully");
        } catch (error) {
            const apiError = toApiError(error);
            setErrorMessage(apiError.detail ?? apiError.message);
            setErrorStatus(apiError.status);
        }
    });

    const isPending = createAudienceMutation.isPending;
    const isSuccess = !!successMessage;

    return (
        <DialogContent className="sm:max-w-lg">
            <DialogHeader>
                <DialogTitle>Create Audience</DialogTitle>
                <DialogDescription>
                    Define a new audience and its scope.
                    {errorStatus ? ` Status: ${errorStatus}` : ""}
                </DialogDescription>
            </DialogHeader>

            {errorMessage ? (
                <Alert variant="destructive">
                    <AlertTitle>Request failed</AlertTitle>
                    <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
            ) : null}

            {successMessage ? (
                <Alert>
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
            ) : null}

            <form className="space-y-4" onSubmit={onSubmit}>
                <div className="space-y-2">
                    <Label htmlFor="audience-name">Name</Label>
                    <Input
                        id="audience-name"
                        placeholder="e.g. CSE 2026 - Batch A"
                        disabled={isPending || isSuccess}
                        {...register("name")}
                    />
                    {errors.name?.message ? (
                        <p className="text-sm text-destructive">{errors.name.message}</p>
                    ) : null}
                </div>

                <div className="space-y-2">
                    <Label>Audience Type</Label>
                    <Select
                        disabled={isPending || isSuccess}
                        defaultValue={AudienceType.class}
                        onValueChange={(value) =>
                            setValue("audience_type", value as FormValues["audience_type"], {
                                shouldDirty: true,
                                shouldTouch: true,
                            })
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                        <SelectContent>
                            {audienceTypeOptions.map((value) => (
                                <SelectItem key={value} value={value}>
                                    {value.charAt(0).toUpperCase() + value.slice(1)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.audience_type?.message ? (
                        <p className="text-sm text-destructive">{errors.audience_type.message}</p>
                    ) : null}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="audience-description">Description (optional)</Label>
                    <Textarea
                        id="audience-description"
                        placeholder="Short description for admins..."
                        disabled={isPending || isSuccess}
                        rows={4}
                        {...register("description")}
                    />
                </div>

                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={props.onClose}>
                        {isSuccess ? "Close" : "Cancel"}
                    </Button>
                    <Button type="submit" disabled={isPending || isSuccess}>
                        {isPending ? (
                            <span className="inline-flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Creating...
                            </span>
                        ) : (
                            "Create"
                        )}
                    </Button>
                </div>
            </form>
        </DialogContent>
    );
}
