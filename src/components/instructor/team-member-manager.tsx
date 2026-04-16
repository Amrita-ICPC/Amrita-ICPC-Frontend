"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAddTeamMember, useTeamMembers } from "@/query/use-teams";
import { useAllUsers } from "@/query/use-users";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
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
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const addMemberSchema = z.object({
    user_id: z.string().min(1, "Please select a user"),
});

type AddMemberFormData = z.infer<typeof addMemberSchema>;

interface TeamMemberManagerProps {
    contestId: string;
    teamId: string;
    onClose: () => void;
}

export function TeamMemberManager({ contestId, teamId, onClose }: TeamMemberManagerProps) {
    const { data: existingMembers } = useTeamMembers(contestId, teamId);
    const { data: users } = useAllUsers(1, 100);
    const { mutate: addTeamMember, isPending } = useAddTeamMember(contestId, teamId);

    const form = useForm<AddMemberFormData>({
        resolver: zodResolver(addMemberSchema),
        defaultValues: {
            user_id: "",
        },
    });

    const existingMemberIds = new Set(existingMembers?.map((m) => m.user_id));
    const availableUsers = users?.data?.filter((u) => !existingMemberIds.has(u.id)) || [];

    const onSubmit = (data: AddMemberFormData) => {
        addTeamMember(
            { user_id: data.user_id },
            {
                onSuccess: () => {
                    form.reset();
                    onClose();
                },
            },
        );
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-106.25">
                <DialogHeader>
                    <DialogTitle>Add Team Member</DialogTitle>
                    <DialogDescription>Select a user to add to this team</DialogDescription>
                </DialogHeader>

                {availableUsers.length === 0 ? (
                    <div className="py-8 text-center text-gray-500">
                        All users are already members of this team
                    </div>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="user_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Select User</FormLabel>
                                        <FormControl>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Choose a user..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableUsers.map((user) => (
                                                        <SelectItem key={user.id} value={user.id}>
                                                            {user.name} ({user.email})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex gap-4">
                                <Button type="submit" disabled={isPending} className="gap-2">
                                    {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {isPending ? "Adding..." : "Add Member"}
                                </Button>
                                <Button type="button" variant="outline" onClick={onClose}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    );
}
