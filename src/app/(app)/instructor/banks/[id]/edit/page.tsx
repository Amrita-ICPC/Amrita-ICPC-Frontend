"use client";

/**
 * Edit Question Bank Page
 * Form for instructors to edit bank metadata
 * Instructor-only access required
 */

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useBank, useUpdateBank } from "@/query/use-banks";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ArrowLeft, BookOpen } from "lucide-react";

/**
 * Validation schema for editing a bank
 */
const editBankSchema = z.object({
    name: z.string().min(1, "Bank name is required").min(3, "Name must be at least 3 characters"),
    description: z
        .string()
        .max(500, "Description must be less than 500 characters")
        .optional()
        .nullable(),
});

type FormData = z.infer<typeof editBankSchema>;

function EditBankContent() {
    const router = useRouter();
    const params = useParams();
    const bankId = params?.id as string;

    const { data: bank, isLoading: bankLoading, error: bankError } = useBank(bankId);
    const updateBank = useUpdateBank();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isValid, isDirty },
    } = useForm<FormData>({
        resolver: zodResolver(editBankSchema),
        mode: "onChange",
        values: {
            name: bank?.name || "",
            description: bank?.description || "",
        },
    });

    useEffect(() => {
        if (bank) {
            reset({
                name: bank.name,
                description: bank.description || "",
            });
        }
    }, [bank, reset]);

    const onSubmit = async (data: FormData) => {
        if (!isValid || !isDirty) return;

        try {
            await updateBank.mutateAsync({
                bankId,
                payload: {
                    name: data.name,
                    description: data.description || undefined,
                },
            });

            // Navigate back to bank detail page
            router.push(`/instructor/banks/${bankId}`);
        } catch {
            // Error is handled by mutation's onError (toast)
        }
    };

    if (bankLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-1/3" />
                <Card className="p-8">
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                </Card>
            </div>
        );
    }

    if (bankError || !bank) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Failed to load bank details. Please try again.</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Button>
            </div>

            <div className="flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-blue-600" />
                <div>
                    <h1 className="text-3xl font-bold">Edit Question Bank</h1>
                    <p className="text-gray-600 mt-1">Update bank name and description</p>
                </div>
            </div>

            <Card className="p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Bank Name */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-semibold mb-2">
                            Bank Name <span className="text-red-500">*</span>
                        </label>
                        <Input
                            id="name"
                            type="text"
                            placeholder="e.g., Data Structures Questions"
                            {...register("name")}
                            className={errors.name ? "border-red-500" : ""}
                        />
                        {errors.name && (
                            <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-semibold mb-2">
                            Description
                        </label>
                        <Textarea
                            id="description"
                            placeholder="Add a description for your question bank (optional)"
                            rows={5}
                            {...register("description")}
                            className={errors.description ? "border-red-500" : ""}
                        />
                        {errors.description && (
                            <p className="text-sm text-red-500 mt-1">
                                {errors.description.message}
                            </p>
                        )}
                    </div>

                    {/* Form Actions */}
                    <div className="flex gap-3 pt-6 border-t">
                        <Button type="button" variant="outline" onClick={() => router.back()}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!isValid || !isDirty || updateBank.isPending}
                            className="gap-2"
                        >
                            <BookOpen className="w-4 h-4" />
                            {updateBank.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}

export default function EditBankPage() {
    return (
        <AuthGuard requiredRoles={["instructor", "admin"]} redirectTo="/dashboard">
            <EditBankContent />
        </AuthGuard>
    );
}
