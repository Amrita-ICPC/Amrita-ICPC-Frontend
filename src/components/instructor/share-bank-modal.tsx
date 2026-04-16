"use client";

/**
 * Share Bank Modal
 * Allows instructors to share a question bank with other users
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    useBankSharedUsers,
    useShareBankWithUser,
    useUnshareBankFromUser,
} from "@/query/use-banks";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Trash2, Share2, Plus } from "lucide-react";

const shareSchema = z.object({
    user_id: z.string().min(1, "User ID or email is required"),
});

type ShareFormData = z.infer<typeof shareSchema>;

interface ShareBankModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    bankId: string;
    bankName: string;
}

export function ShareBankModal({ isOpen, onOpenChange, bankId, bankName }: ShareBankModalProps) {
    const { data: sharedUsers, isLoading } = useBankSharedUsers(isOpen ? bankId : null);
    const shareMutation = useShareBankWithUser();
    const unshareMutation = useUnshareBankFromUser();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ShareFormData>({
        resolver: zodResolver(shareSchema),
    });

    const onShare = async (data: ShareFormData) => {
        try {
            await shareMutation.mutateAsync({
                bankId,
                payload: { user_id: data.user_id },
            });
            reset();
        } catch {
            // Error handled by mutation
        }
    };

    const handleUnshare = (userId: string) => {
        unshareMutation.mutate({
            bankId,
            userId,
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Share2 className="w-5 h-5" />
                        Share &quot;{bankName}&quot;
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Share Form */}
                    <form onSubmit={handleSubmit(onShare)} className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Share with User
                            </label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Enter user ID or email"
                                    {...register("user_id")}
                                    className={errors.user_id ? "border-red-500" : ""}
                                />
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={shareMutation.isPending}
                                    className="gap-1"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add
                                </Button>
                            </div>
                            {errors.user_id && (
                                <p className="text-sm text-red-500 mt-1">
                                    {errors.user_id.message}
                                </p>
                            )}
                        </div>
                    </form>

                    {/* Shared Users List */}
                    <div>
                        <h3 className="text-sm font-semibold mb-3">
                            Shared with ({sharedUsers?.length || 0})
                        </h3>

                        {isLoading ? (
                            <div className="space-y-2">
                                {[...Array(2)].map((_, i) => (
                                    <Skeleton key={i} className="h-10 w-full" />
                                ))}
                            </div>
                        ) : !sharedUsers || sharedUsers.length === 0 ? (
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    This bank is not shared with anyone yet. Add users to share it.
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {sharedUsers.map((user) => (
                                    <div
                                        key={user.user_id}
                                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                                    >
                                        <div>
                                            <p className="font-medium text-sm">
                                                {user.name || "Unknown"}
                                            </p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => handleUnshare(user.user_id)}
                                            disabled={unshareMutation.isPending}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
