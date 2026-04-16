"use client";

import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateTeam } from "@/query/use-teams";
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

const createTeamSchema = z.object({
    name: z.string().min(1, "Team name is required").min(3, "Name must be at least 3 characters"),
    description: z.string().optional(),
});

type CreateTeamFormData = z.infer<typeof createTeamSchema>;

export function CreateTeamForm() {
    const router = useRouter();
    const params = useParams();
    const contestId = params?.id as string;

    const { mutate: createTeamMutation, isPending } = useCreateTeam(contestId);

    const form = useForm<CreateTeamFormData>({
        resolver: zodResolver(createTeamSchema),
        defaultValues: {
            name: "",
            description: "",
        },
    });

    const onSubmit = (data: CreateTeamFormData) => {
        createTeamMutation(
            {
                name: data.name,
                description: data.description,
            },
            {
                onSuccess: () => {
                    router.push(`/instructor/contests/${contestId}/teams`);
                },
            },
        );
    };

    return (
        <Card className="w-full max-w-2xl">
            <CardHeader>
                <CardTitle>Create Team</CardTitle>
                <CardDescription>Create a new team for this contest</CardDescription>
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
                            <Button type="submit" disabled={isPending} className="gap-2">
                                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                                {isPending ? "Creating..." : "Create Team"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    router.push(`/instructor/contests/${contestId}/teams`)
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
