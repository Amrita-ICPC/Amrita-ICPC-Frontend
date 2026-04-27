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
            <DialogContent className="sm:max-w-[500px] border-white/10 bg-[#0f1117] text-white">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Create New Bank</DialogTitle>
                    <DialogDescription className="text-white/60">
                        Create a container for your questions. You can share this bank with other
                        instructors later.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-white/80">Bank Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g., Dynamic Programming Basics"
                                            className="border-white/10 bg-white/5 focus-visible:ring-primary/50"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-red-400" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-white/80">
                                        Description (Optional)
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Describe the purpose or content of this bank..."
                                            className="min-h-[120px] resize-none border-white/10 bg-white/5 focus-visible:ring-primary/50"
                                            {...field}
                                            value={field.value ?? ""}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-red-400" />
                                </FormItem>
                            )}
                        />
                        <DialogFooter className="pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                className="border-white/10 hover:bg-white/5"
                                disabled={isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isPending}
                                className="min-w-[120px] shadow-[0_0_20px_rgba(var(--primary),0.2)]"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    "Create Bank"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
