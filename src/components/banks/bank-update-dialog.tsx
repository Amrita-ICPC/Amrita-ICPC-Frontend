"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as zod from "zod";

import {
    getGetAllBanksApiV1BanksGetQueryKey,
    getGetBankApiV1BanksBankIdGetQueryKey,
    useUpdateBankApiV1BanksBankIdPatch,
} from "@/api/generated/banks/banks";
import { BankResponse } from "@/api/generated/model/bankResponse";
import { UpdateBankApiV1BanksBankIdPatchBody } from "@/api/generated/zod/banks/banks";
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
import { toApiError } from "@/lib/api/error";

type BankUpdateFormValues = zod.infer<typeof UpdateBankApiV1BanksBankIdPatchBody>;

interface BankUpdateDialogProps {
    bank: BankResponse;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    trigger?: React.ReactNode;
}

export function BankUpdateDialog({
    bank,
    open: controlledOpen,
    onOpenChange: setControlledOpen,
    trigger,
}: BankUpdateDialogProps) {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
    const open = controlledOpen ?? uncontrolledOpen;
    const onOpenChange = setControlledOpen ?? setUncontrolledOpen;

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
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Bank Details</DialogTitle>
                    <DialogDescription>
                        Update the name and description of your question bank.
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
                                        <Input {...field} value={field.value ?? ""} />
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
                                onClick={() => onOpenChange(false)}
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
