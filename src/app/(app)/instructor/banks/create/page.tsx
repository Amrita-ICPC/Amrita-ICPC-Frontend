"use client";

/**
 * Create Question Bank Page
 * Form for instructors to create new question banks
 * Instructor-only access required
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useCreateBank } from "@/query/use-banks";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, BookOpen } from "lucide-react";

/**
 * Validation schema for creating a bank
 */
const createBankSchema = z.object({
    name: z.string().min(1, "Bank name is required").min(3, "Name must be at least 3 characters"),
    description: z
        .string()
        .max(500, "Description must be less than 500 characters")
        .optional()
        .nullable(),
});

type FormData = z.infer<typeof createBankSchema>;

function CreateBankContent() {
    const router = useRouter();
    const createBankMutation = useCreateBank();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<FormData>({
        resolver: zodResolver(createBankSchema),
        mode: "onChange",
    });

    const onSubmit = async (data: FormData) => {
        if (!isValid) return;

        setIsSubmitting(true);
        try {
            const result = await createBankMutation.mutateAsync({
                name: data.name,
                description: data.description || undefined,
            });

            // Navigate to the bank detail page or banks list
            router.push(`/instructor/banks/${result.id}`);
        } catch {
            // Error is handled by mutation's onError (toast)
            setIsSubmitting(false);
        }
    };

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
                    <h1 className="text-3xl font-bold">Create Question Bank</h1>
                    <p className="text-gray-600 mt-1">
                        Create a new bank to organize and manage your question library
                    </p>
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

                    {/* Info Alert */}
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            After creating the bank, you can add questions from scratch or import
                            existing questions from other banks.
                        </AlertDescription>
                    </Alert>

                    {/* Form Actions */}
                    <div className="flex gap-3 pt-6 border-t">
                        <Button type="button" variant="outline" onClick={() => router.back()}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!isValid || isSubmitting || createBankMutation.isPending}
                            className="gap-2"
                        >
                            <BookOpen className="w-4 h-4" />
                            {createBankMutation.isPending ? "Creating..." : "Create Bank"}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}

export default function CreateBankPage() {
    return (
        <AuthGuard requiredRoles={["instructor", "admin"]} redirectTo="/dashboard">
            <CreateBankContent />
        </AuthGuard>
    );
}
