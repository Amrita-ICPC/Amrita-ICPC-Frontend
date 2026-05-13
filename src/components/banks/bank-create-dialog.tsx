"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

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
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    useCreateBankApiV1BanksPost,
    getGetAllBanksApiV1BanksGetQueryKey,
} from "@/api/generated/banks/banks";
import { CreateBankApiV1BanksPostBody } from "@/api/generated/zod/banks/banks";
import { toApiError } from "@/lib/api/error";
import * as zod from "zod";

type BankFormValues = zod.infer<typeof CreateBankApiV1BanksPostBody>;

export function BankCreateDialog() {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();

    const { mutate: createBank, isPending } = useCreateBankApiV1BanksPost({
        mutation: {
            onSuccess: () => {
                toast.success("Bank created successfully");
                setOpen(false);
                form.reset();
                // Invalidate the banks list to refresh the UI
                queryClient.invalidateQueries({
                    queryKey: getGetAllBanksApiV1BanksGetQueryKey(),
                });
            },
            onError: (error: unknown) => {
                const apiError = toApiError(error);
                toast.error(apiError.message);
            },
        },
    });

    const form = useForm<BankFormValues>({
        resolver: zodResolver(CreateBankApiV1BanksPostBody),
        defaultValues: {
            name: "",
            description: "",
        },
    });

    const onSubmit = (data: BankFormValues) => {
        createBank({ data });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 shadow-[0_0_15px_rgba(var(--primary),0.3)]">
                    <Plus className="h-4 w-4" />
                    New Bank
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create Question Bank</DialogTitle>
                    <DialogDescription>
                        Create a container for your questions. You can share this bank with other
                        instructors later.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Bank name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g., Dynamic Programming Basics"
                                            {...field}
                                        />
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
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Describe the purpose or content of this bank..."
                                            className="min-h-24 resize-none"
                                            {...field}
                                            value={field.value ?? ""}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                disabled={isPending}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isPending} className="min-w-28">
                                {isPending ? (
                                    <>
                                        <Loader2
                                            data-icon="inline-start"
                                            className="animate-spin"
                                        />
                                        Creating...
                                    </>
                                ) : (
                                    "Create bank"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
