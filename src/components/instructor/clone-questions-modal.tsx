"use client";

/**
 * Clone Questions Modal
 * Allows instructors to clone questions from another bank to the current bank
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { useCloneQuestions } from "@/query/use-banks";
import { Bank } from "@/services/banks";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface CloneQuestionsModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    destBankId: string;
}

/**
 * Fetch all available banks to clone from
 */
async function getSourceBanks(): Promise<{ data: Bank[] }> {
    return api.get("/api/v1/banks?page=1&page_size=100");
}

export function CloneQuestionsModal({
    isOpen,
    onOpenChange,
    destBankId,
}: CloneQuestionsModalProps) {
    const [selectedSourceBankId, setSelectedSourceBankId] = useState<string | null>(null);

    const { data: banksData, isLoading: banksLoading } = useQuery({
        queryKey: ["banks-for-clone"],
        queryFn: getSourceBanks,
        enabled: isOpen,
    });

    const cloneMutation = useCloneQuestions();

    // Filter out the destination bank from the list
    const availableBanks = (banksData?.data || []).filter((bank) => bank.id !== destBankId);

    const handleClone = () => {
        if (!selectedSourceBankId) {
            alert("Please select a source bank");
            return;
        }

        cloneMutation.mutate({
            destBankId,
            payload: {
                source_bank_id: selectedSourceBankId,
                // Clone all questions by default (empty array)
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Clone Questions from Another Bank</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-3">Select Source Bank</label>

                        {banksLoading ? (
                            <div className="space-y-2">
                                {[...Array(3)].map((_, i) => (
                                    <Skeleton key={i} className="h-12 w-full" />
                                ))}
                            </div>
                        ) : availableBanks.length === 0 ? (
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    No other banks available to clone from. You may be the only
                                    instructor or all banks are private.
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {availableBanks.map((bank) => (
                                    <button
                                        key={bank.id}
                                        onClick={() => setSelectedSourceBankId(bank.id)}
                                        className={`w-full text-left p-3 border-2 rounded-lg transition ${
                                            selectedSourceBankId === bank.id
                                                ? "border-blue-500 bg-blue-50"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-medium text-sm">{bank.name}</p>
                                                {bank.description && (
                                                    <p className="text-xs text-gray-600 mt-1">
                                                        {bank.description}
                                                    </p>
                                                )}
                                            </div>
                                            <span className="text-xs font-medium text-gray-500 ml-2 whitespace-nowrap">
                                                {bank.question_count || 0} questions
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs text-blue-700">
                            <strong>Note:</strong> All questions from the selected bank will be
                            cloned to this bank. Duplicate questions will not be added.
                        </p>
                    </div>

                    <div className="flex gap-2 justify-end">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={cloneMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleClone}
                            disabled={
                                !selectedSourceBankId ||
                                cloneMutation.isPending ||
                                availableBanks.length === 0
                            }
                        >
                            {cloneMutation.isPending ? "Cloning..." : "Clone Questions"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
