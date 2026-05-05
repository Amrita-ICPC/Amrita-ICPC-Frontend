"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Copy, Loader2, Search, Timer, Trophy } from "lucide-react";
import { useGetAllBanks, useCloneBankQuestions, bankQuestionsKey } from "@/query/bank-query";
import { useCloneQuestionsFromBank, contestQuestionsKey } from "@/query/contest-query";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { BankResponse } from "@/api/generated/model";

interface BankCloneDialogProps {
    targetId: string;
    targetType?: "bank" | "contest";
    children?: React.ReactNode;
}

export function BankCloneDialog({ targetId, targetType = "bank", children }: BankCloneDialogProps) {
    const [open, setOpen] = useState(false);
    const [sourceBankId, setSourceBankId] = useState<string>("");
    const [isPartial, setIsPartial] = useState(false);
    const [defaultScore, setDefaultScore] = useState<number>(100);
    const [defaultDuration, setDefaultDuration] = useState<string>("");
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data: banksData, isLoading: isLoadingBanks } = useGetAllBanks();
    const banks = banksData?.data || [];

    // Filter out the target if it's a bank
    const filteredBanks = banks.filter((bank) => targetType === "contest" || bank.id !== targetId);

    const bankCloneMutation = useCloneBankQuestions({
        mutation: {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: bankQuestionsKey(targetId) });
                toast.success("All questions cloned successfully!");
                setOpen(false);
            },
        },
    });

    const contestCloneMutation = useCloneQuestionsFromBank({
        mutation: {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: contestQuestionsKey(targetId) });
                toast.success("All questions cloned successfully!");
                setOpen(false);
            },
        },
    });

    const isPending = bankCloneMutation.isPending || contestCloneMutation.isPending;

    const handleProceed = async () => {
        if (!sourceBankId) {
            toast.error("Please select a source bank");
            return;
        }

        if (isPartial) {
            if (targetType === "contest") {
                const params = new URLSearchParams();
                params.set("score", defaultScore.toString());
                if (defaultDuration) params.set("duration", defaultDuration);
                router.push(`/contest/${targetId}/clone/${sourceBankId}?${params.toString()}`);
            } else {
                router.push(`/banks/${targetId}/clone/${sourceBankId}`);
            }
            setOpen(false);
        } else {
            try {
                if (targetType === "contest") {
                    await contestCloneMutation.mutateAsync({
                        contestId: targetId,
                        data: {
                            bank_id: sourceBankId,
                            copy_all: true,
                            score: defaultScore,
                            duration: defaultDuration ? parseInt(defaultDuration) : null,
                        },
                    });
                } else {
                    await bankCloneMutation.mutateAsync({
                        sourceBankId,
                        data: {
                            target_bank_id: targetId,
                            copy_all: true,
                        },
                    });
                }
            } catch (error) {
                // Error handled by global handler
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="outline" size="sm" className="gap-2">
                        <Copy className="h-4 w-4" />
                        Clone Questions
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Clone Questions</DialogTitle>
                    <DialogDescription>
                        Select a source bank to clone questions into this{" "}
                        {targetType === "contest" ? "contest" : "bank"}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="source-bank">Source Bank</Label>
                        <Select
                            value={sourceBankId}
                            onValueChange={setSourceBankId}
                            disabled={isLoadingBanks}
                        >
                            <SelectTrigger id="source-bank">
                                <SelectValue
                                    placeholder={
                                        isLoadingBanks ? "Loading banks..." : "Select a bank"
                                    }
                                />
                            </SelectTrigger>
                            <SelectContent>
                                {filteredBanks.map((bank: BankResponse) => (
                                    <SelectItem key={bank.id} value={bank.id}>
                                        {bank.name}
                                    </SelectItem>
                                ))}
                                {filteredBanks.length === 0 && !isLoadingBanks && (
                                    <p className="p-2 text-sm text-muted-foreground">
                                        No other banks available
                                    </p>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {targetType === "contest" && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="default-score" className="flex items-center gap-2">
                                    <Trophy className="h-4 w-4 text-primary" />
                                    Default Score
                                </Label>
                                <Input
                                    id="default-score"
                                    type="number"
                                    min={0}
                                    value={defaultScore}
                                    onChange={(e) => setDefaultScore(parseInt(e.target.value) || 0)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="default-duration"
                                    className="flex items-center gap-2"
                                >
                                    <Timer className="h-4 w-4 text-primary" />
                                    Duration (sec)
                                </Label>
                                <Input
                                    id="default-duration"
                                    type="number"
                                    min={0}
                                    placeholder="Optional"
                                    value={defaultDuration}
                                    onChange={(e) => setDefaultDuration(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="partial-clone"
                            checked={isPartial}
                            onCheckedChange={(checked) => setIsPartial(!!checked)}
                        />
                        <div className="grid gap-1.5 leading-none">
                            <Label
                                htmlFor="partial-clone"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Partial Cloning
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Select specific questions to clone instead of all.
                            </p>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleProceed}
                        disabled={!sourceBankId || isPending}
                        className="gap-2"
                    >
                        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                        {isPartial ? "Next" : "Clone All"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
