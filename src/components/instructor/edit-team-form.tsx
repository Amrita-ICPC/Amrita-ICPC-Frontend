"use client";

import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTeam, useUpdateTeam } from "@/query/use-teams";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const updateTeamSchema = z.object({
    name: z.string().min(1, "Team name is required").min(3, "Name must be at least 3 characters"),
    description: z.string().optional(),
});

type UpdateTeamFormData = z.infer<typeof updateTeamSchema>;

export function EditTeamForm() {
    const router = useRouter();
    const params = useParams();
    const contestId = params?.id as string;
    const teamId = params?.["team_id"] as string;

    const { data: team, isLoading: isTeamLoading } = useTeam(contestId, teamId);
    const { mutate: updateTeamMutation, isPending: isUpdating } = useUpdateTeam(contestId);

    const form = useForm<UpdateTeamFormData>({
        resolver: zodResolver(updateTeamSchema),
        defaultValues: {
            name: team?.name || "",
            description: team?.description || "",
        },
        values: {
            name: team?.name || "",
            description: team?.description || "",
        },
    });

    const onSubmit = (data: UpdateTeamFormData) => {
        updateTeamMutation(
            {
                teamId,
                payload: {
                    name: data.name,
                    description: data.description,
                },
            },
            {
                onSuccess: () => {
                    router.push(`/instructor/contests/${contestId}/teams/${teamId}`);
                },
            },
        );
    };

    if (isTeamLoading) {
        return (
            <Card className="w-full max-w-2xl">
                <CardContent className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </CardContent>
            </Card>
        );
    }

    if (!team) {
        return (
            <Card className="w-full max-w-2xl">
                <CardContent className="py-8 text-center text-red-600">Team not found</CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-2xl">
            <CardHeader>
                <CardTitle>Edit Team</CardTitle>
                <CardDescription>Update team information</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Team Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter team name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Enter team description"
                                            className="resize-none"
                                            rows={4}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex gap-4">
                            <Button type="submit" disabled={isUpdating} className="gap-2">
                                {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
                                {isUpdating ? "Saving..." : "Save Changes"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    router.push(`/instructor/contests/${contestId}/teams/${teamId}`)
                                }
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
