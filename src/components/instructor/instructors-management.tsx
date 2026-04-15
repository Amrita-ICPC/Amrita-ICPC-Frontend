"use client";

/**
 * Contest instructors management component
 * Displays current instructors and allows adding/removing them
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    useContestInstructors,
    useAddContestInstructor,
    useRemoveContestInstructor,
} from "@/query/use-contest-instructors";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Trash2, UserPlus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const addInstructorSchema = z.object({
    user_id: z.string().min(1, "User ID is required"),
});

type AddInstructorFormData = z.infer<typeof addInstructorSchema>;

interface InstructorsManagementProps {
    contestId: string;
}

export function InstructorsManagement({ contestId }: InstructorsManagementProps) {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const { data: instructors, isLoading, error } = useContestInstructors(contestId);
    const addInstructorMutation = useAddContestInstructor();
    const removeInstructorMutation = useRemoveContestInstructor();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<AddInstructorFormData>({
        resolver: zodResolver(addInstructorSchema),
    });

    const onAddInstructor = async (data: AddInstructorFormData) => {
        try {
            await addInstructorMutation.mutateAsync({
                contestId,
                payload: { user_id: data.user_id },
            });
            reset();
            setIsAddDialogOpen(false);
        } catch {
            // Error is handled by mutation's onError
        }
    };

    const handleRemoveInstructor = (instructorId: string) => {
        removeInstructorMutation.mutate({
            contestId,
            instructorId,
        });
    };

    if (isLoading) {
        return (
            <Card className="p-6">
                <div className="space-y-4">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="p-6">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Failed to load instructors. Please try again.
                    </AlertDescription>
                </Alert>
            </Card>
        );
    }

    return (
        <>
            <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold">Co-Instructors</h2>
                    <Button size="sm" className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
                        <UserPlus className="w-4 h-4" />
                        Add Instructor
                    </Button>
                </div>

                {instructors && instructors.length > 0 ? (
                    <div className="space-y-3">
                        {instructors.map((instructor) => (
                            <div
                                key={instructor.id}
                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                            >
                                <div>
                                    <p className="font-medium">{instructor.name || "Unknown"}</p>
                                    <p className="text-sm text-gray-600">{instructor.email}</p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="gap-2"
                                    onClick={() => handleRemoveInstructor(instructor.id)}
                                    disabled={removeInstructorMutation.isPending}
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Remove
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-600 mb-4">
                            No co-instructors added yet. You can manage this contest alone or add
                            others to help.
                        </p>
                        <Badge variant="outline">Solo Mode</Badge>
                    </div>
                )}
            </Card>

            {/* Add Instructor Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Co-Instructor</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit(onAddInstructor)} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                User ID or Email
                            </label>
                            <Input
                                placeholder="Enter user ID or email address"
                                {...register("user_id")}
                            />
                            {errors.user_id && (
                                <p className="text-sm text-red-500 mt-1">
                                    {errors.user_id.message}
                                </p>
                            )}
                        </div>

                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                The user must have an account in the system before they can be added
                                as an instructor.
                            </AlertDescription>
                        </Alert>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsAddDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={addInstructorMutation.isPending}>
                                {addInstructorMutation.isPending ? "Adding..." : "Add Instructor"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
