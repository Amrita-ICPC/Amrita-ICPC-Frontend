"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Settings2, Save } from "lucide-react";
import * as zod from "zod";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    useEditTeamApiV1StudentsTeamsTeamIdPatch,
    getGetMyTeamsApiV1StudentsTeamsGetQueryKey,
} from "@/api/generated/students/students";
import { EditTeamApiV1StudentsTeamsTeamIdPatchBody } from "@/api/generated/zod/students/students";
import type { StudentTeamCardResponse } from "@/api/generated/model";
import { Switch } from "@/components/ui/switch";

type EditTeamFormValues = zod.infer<typeof EditTeamApiV1StudentsTeamsTeamIdPatchBody>;

interface StudentEditTeamDialogProps {
    team: StudentTeamCardResponse;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function StudentEditTeamDialog({ team, open, onOpenChange }: StudentEditTeamDialogProps) {
    const { mutate: editTeam, isPending } = useEditTeamApiV1StudentsTeamsTeamIdPatch({
        mutation: {
            meta: {
                successMessage: "Team updated successfully!",
                invalidateKeys: [getGetMyTeamsApiV1StudentsTeamsGetQueryKey()],
            },
            onSuccess: () => {
                onOpenChange(false);
            },
        },
    });

    const form = useForm<EditTeamFormValues>({
        resolver: zodResolver(EditTeamApiV1StudentsTeamsTeamIdPatchBody),
        defaultValues: {
            name: team.title || "",
            description: team.description || null,
            is_public: team.is_public ?? true,
        },
    });

    // Reset form values if the dialog opens or team changes
    useEffect(() => {
        if (open) {
            form.reset({
                name: team.title || "",
                description: team.description || null,
                is_public: team.is_public ?? true,
            });
        }
    }, [open, team, form]);

    const onSubmit = (data: EditTeamFormValues) => {
        editTeam({ teamId: team.id, data });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                            <Settings2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-bold leading-tight">
                                Edit Team Details
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                                Update your team&apos;s name and strategy description.
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
                                            value={field.value ?? ""}
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
                                    onOpenChange(false);
                                    form.reset();
                                }}
                                disabled={isPending}
                                className="min-w-20 cursor-pointer"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isPending}
                                className="min-w-32 cursor-pointer bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2
                                            data-icon="inline-start"
                                            className="animate-spin h-4 w-4 mr-2"
                                        />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Changes
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
