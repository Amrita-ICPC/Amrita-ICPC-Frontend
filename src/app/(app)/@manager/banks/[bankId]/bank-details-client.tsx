"use client";

import { useState } from "react";
import { ArrowLeft, Plus, Share2, Settings, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BankQuestionsTable } from "@/components/banks/bank-questions-table";
import { BankShareDialog } from "@/components/banks/bank-share-dialog";
import { BankUpdateDialog } from "@/components/banks/bank-update-dialog";
import { 
    useGetBankApiV1BanksBankIdGet, 
    useDeleteBankApiV1BanksBankIdDelete,
    getGetAllBanksApiV1BanksGetQueryKey 
} from "@/api/generated/banks/banks";
import { 
    useGetBankQuestionsApiV1BanksBankIdQuestionsGet, 
    useRemoveQuestionsFromBankApiV1BanksBankIdQuestionsDelete 
} from "@/api/generated/bank-questions/bank-questions";
import { toApiError } from "@/lib/api/error";

export function BankDetailsClient() {
    const params = useParams();
    const bankId = params.bankId as string;
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data: bankData, isLoading: isBankLoading, isError: isBankError } = useGetBankApiV1BanksBankIdGet(bankId);
    const { data: questionsData, isLoading: isQuestionsLoading } = useGetBankQuestionsApiV1BanksBankIdQuestionsGet(bankId, {});
    
    const { mutate: removeQuestions, isPending: isRemoving } = useRemoveQuestionsFromBankApiV1BanksBankIdQuestionsDelete({
        mutation: {
            onSuccess: () => {
                toast.success("Question removed from bank");
                queryClient.invalidateQueries({
                    queryKey: [`/api/v1/banks/${bankId}/questions`],
                });
            },
            onError: (error: any) => {
                const apiError = toApiError(error);
                toast.error(apiError.message);
            }
        }
    });

    const { mutate: deleteBank, isPending: isDeleting } = useDeleteBankApiV1BanksBankIdDelete({
        mutation: {
            onSuccess: () => {
                toast.success("Bank deleted successfully");
                queryClient.invalidateQueries({
                    queryKey: getGetAllBanksApiV1BanksGetQueryKey(),
                });
                router.push("/banks");
            },
            onError: (error: any) => {
                const apiError = toApiError(error);
                toast.error(apiError.message);
            }
        }
    });

    const [activeTab, setActiveTab] = useState("questions");
    const [isShareOpen, setIsShareOpen] = useState(false);
    const [isUpdateOpen, setIsUpdateOpen] = useState(false);

    if (isBankLoading) {
        return (
            <div className="flex flex-col space-y-6">
                <div className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                </div>
                <Skeleton className="h-[400px] w-full" />
            </div>
        );
    }

    if (isBankError || !bankData?.data) {
        return (
            <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 rounded-lg border border-dashed text-center border-white/10 bg-white/5">
                <h2 className="text-xl font-semibold text-white">Bank not found</h2>
                <p className="text-white/40 text-sm">The bank you're looking for doesn't exist or you don't have access.</p>
                <Button variant="outline" asChild className="border-white/10">
                    <Link href="/banks">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Banks
                    </Link>
                </Button>
            </div>
        );
    }

    const bank = bankData.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const questions = (questionsData as any)?.data || [];

    const handleRemoveQuestion = (questionId: string) => {
        if (confirm("Are you sure you want to remove this question from the bank?")) {
            removeQuestions({ 
                bankId, 
                data: { question_ids: [questionId] } 
            });
        }
    };

    const handleDeleteBank = () => {
        if (confirm("CRITICAL: Are you sure you want to delete this bank? This action cannot be undone and will remove all question associations.")) {
            deleteBank({ bankId });
        }
    };

    return (
        <div className="flex h-full flex-col space-y-8 pb-12">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                    <Button variant="ghost" size="icon" asChild className="mt-1 text-white/40 hover:text-white hover:bg-white/5">
                        <Link href="/banks">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight text-white">{bank.name}</h1>
                            {/* @ts-ignore - is_public might be in standard response */}
                            {bank.is_public && (
                                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary border border-primary/20">
                                    Public
                                </span>
                            )}
                        </div>
                        <p className="text-white/50 mt-1 max-w-2xl">
                            {bank.description || "No description provided for this bank."}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <Button variant="outline" size="sm" onClick={() => setIsShareOpen(true)} className="border-white/10 bg-white/5 hover:bg-white/10">
                        <Share2 className="mr-2 h-4 w-4" />
                        Manage Access
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setIsUpdateOpen(true)} className="border-white/10 bg-white/5 hover:bg-white/10">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                    </Button>
                    <Button size="sm" asChild className="shadow-[0_0_15px_rgba(var(--primary),0.2)]">
                        <Link href={`/banks/${bankId}/questions/create`}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Question
                        </Link>
                    </Button>
                </div>
            </div>

            <BankShareDialog 
                bankId={bankId}
                bankName={bank.name}
                open={isShareOpen}
                onOpenChange={setIsShareOpen}
            />

            <BankUpdateDialog 
                bank={bank as any}
                open={isUpdateOpen}
                onOpenChange={setIsUpdateOpen}
            />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-transparent border-b border-white/10 rounded-none h-auto p-0 space-x-8">
                    <TabsTrigger 
                        value="questions" 
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 py-4 text-sm font-semibold text-white/40 hover:text-white/60 transition-all"
                    >
                        Questions ({questions.length})
                    </TabsTrigger>
                    <TabsTrigger 
                        value="settings" 
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 py-4 text-sm font-semibold text-white/40 hover:text-white/60 transition-all"
                    >
                        General Settings
                    </TabsTrigger>
                </TabsList>
                
                <TabsContent value="questions" className="pt-8 focus-visible:outline-none focus-visible:ring-0">
                    {isQuestionsLoading ? (
                        <div className="flex min-h-[300px] items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <BankQuestionsTable 
                            bankId={bankId}
                            questions={questions} 
                            onRemove={handleRemoveQuestion}
                            isRemoving={isRemoving}
                        />
                    )}
                </TabsContent>
                
                <TabsContent value="settings" className="pt-8 focus-visible:outline-none focus-visible:ring-0">
                    <div className="max-w-2xl space-y-8">
                        <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-white">Bank Details</h3>
                                    <p className="text-sm text-white/50">Edit name and description.</p>
                                </div>
                                <Button onClick={() => setIsUpdateOpen(true)} variant="outline" className="border-white/10">
                                    Edit Details
                                </Button>
                            </div>
                        </div>

                        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 space-y-4">
                            <div>
                                <h3 className="text-lg font-bold text-red-400">Danger Zone</h3>
                                <p className="text-sm text-white/50 mt-1">
                                    Once you delete a bank, there is no going back. All question associations will be removed.
                                </p>
                            </div>
                            <Button 
                                variant="destructive" 
                                className="bg-red-500 hover:bg-red-600 gap-2"
                                onClick={handleDeleteBank}
                                disabled={isDeleting}
                            >
                                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                Delete this bank
                            </Button>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
