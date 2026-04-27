"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
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
    useUpdateBankApiV1BanksBankIdPatch,
    getGetBankApiV1BanksBankIdGetQueryKey,
    getGetAllBanksApiV1BanksGetQueryKey,
} from "@/api/generated/banks/banks";
import { UpdateBankApiV1BanksBankIdPatchBody } from "@/api/generated/zod/banks/banks";
import { BankResponse } from "@/api/generated/model/bankResponse";
import { toApiError } from "@/lib/api/error";
import * as zod from "zod";

type BankUpdateFormValues = zod.infer<typeof UpdateBankApiV1BanksBankIdPatchBody>;

interface BankUpdateDialogProps {
    bank: BankResponse;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function BankUpdateDialog({ bank, open, onOpenChange }: BankUpdateDialogProps) {
    const queryClient = useQueryClient();

    const { mutate: updateBank, isPending } = useUpdateBankApiV1BanksBankIdPatch({
        mutation: {
            onSuccess: () => {
                toast.success("Bank updated successfully");
                onOpenChange(false);
                // Invalidate both the detail and the list
                queryClient.invalidateQueries({
                    queryKey: getGetBankApiV1BanksBankIdGetQueryKey(bank.id),
                });
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

    const form = useForm<BankUpdateFormValues>({
        resolver: zodResolver(UpdateBankApiV1BanksBankIdPatchBody),
        defaultValues: {
            name: bank.name,
            description: bank.description ?? "",
        },
    });

    useEffect(() => {
        if (open) {
            form.reset({
                name: bank.name,
                description: bank.description ?? "",
            });
        }
    }, [open, bank, form]);

    const onSubmit = (data: BankUpdateFormValues) => {
        updateBank({ bankId: bank.id, data });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] border-white/10 bg-[#0f1117] text-white">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Edit Bank Details</DialogTitle>
                    <DialogDescription className="text-white/60">
                        Update the name and description of your question bank.
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
                                            className="border-white/10 bg-white/5 focus-visible:ring-primary/50"
                                            {...field}
                                            value={field.value ?? ""}
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
                                onClick={() => onOpenChange(false)}
                                className="border-white/10 hover:bg-white/5"
                                disabled={isPending}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isPending} className="min-w-[100px]">
                                {isPending ? "Saving..." : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
