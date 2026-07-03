"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Users } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import {
    getGetMyTeamsApiV1StudentsTeamsGetQueryKey,
    useCreateTeamApiV1StudentsTeamsPost,
} from "@/api/generated/students/students";
import { CreateTeamApiV1StudentsTeamsPostBody } from "@/api/generated/zod/students/students";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

interface CreateTeamInput {
    name: string;
    description?: string | null | undefined;
    is_public?: boolean | undefined;
}

interface CreateTeamOutput {
    name: string;
    description?: string | null | undefined;
    is_public: boolean;
}

interface StudentCreateTeamDialogProps {
    /** Optionally render as a standalone trigger button (default) */
    trigger?: React.ReactNode;
}

export function StudentCreateTeamDialog({ trigger }: StudentCreateTeamDialogProps) {
    const [open, setOpen] = useState(false);

    const { mutate: createTeam, isPending } = useCreateTeamApiV1StudentsTeamsPost({
        mutation: {
            meta: {
                successMessage: "Team created successfully!",
                invalidateKeys: [getGetMyTeamsApiV1StudentsTeamsGetQueryKey()],
            },
            onSuccess: () => {
                setOpen(false);
                form.reset();
            },
        },
    });

    const form = useForm<CreateTeamInput, any, CreateTeamOutput>({
        resolver: zodResolver(CreateTeamApiV1StudentsTeamsPostBody),
        defaultValues: {
            name: "",
            description: null,
            is_public: true,
        },
    });

    const onSubmit = (data: CreateTeamOutput) => {
        createTeam({ data });
    };

    const defaultTrigger = (
        <Button className="flex h-9 items-center gap-1.5 rounded-lg border border-transparent bg-primary px-4.5 text-xs font-extrabold text-primary-foreground shadow-md shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-primary/35">
            <Plus className="h-4 w-4 stroke-[2.5]" />
            Create Team
        </Button>
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger ?? defaultTrigger}</DialogTrigger>

            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                            <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-bold leading-tight">
                                Create a New Team
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                                You will automatically become the team leader.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex flex-col gap-5 pt-1"
                    >
                        {/* Team Name */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-semibold">
                                        Team Name <span className="text-destructive">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g., ByteForce, CodeStrike..."
                                            className="h-10"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription className="text-xs text-muted-foreground">
                                        Between 3 and 100 characters.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Team Description */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-semibold">
                                        Description{" "}
                                        <span className="text-muted-foreground font-normal text-xs">
                                            (optional)
                                        </span>
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Briefly describe your team's strategy or goal..."
                                            className="min-h-[90px] resize-none"
                                            {...field}
                                            value={field.value ?? ""}
                                            onChange={(e) => field.onChange(e.target.value || null)}
                                        />
                                    </FormControl>
                                    <FormDescription className="text-xs text-muted-foreground">
                                        Max 500 characters.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Public/Private Visibility Toggle */}
                        <FormField
                            control={form.control}
                            name="is_public"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-xl border border-slate-200/60 dark:border-white/10 p-3.5 shadow-xs bg-slate-50/50 dark:bg-slate-900/10">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-sm font-semibold flex items-center gap-1.5 text-foreground cursor-pointer">
                                            🌐 Public Team
                                        </FormLabel>
                                        <FormDescription className="text-[11px] text-muted-foreground max-w-[290px] font-semibold leading-normal">
                                            Allows other students to search for your team and
                                            request to join. If disabled, your team is private.
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value ?? true}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="gap-2 pt-1">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setOpen(false);
                                    form.reset();
                                }}
                                disabled={isPending}
                                className="min-w-20"
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isPending} className="min-w-32">
                                {isPending ? (
                                    <>
                                        <Loader2
                                            data-icon="inline-start"
                                            className="animate-spin h-4 w-4"
                                        />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="h-4 w-4" />
                                        Create Team
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
