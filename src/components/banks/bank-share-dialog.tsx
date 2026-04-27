"use client";

import { UserPlus, Trash2, Loader2, Shield, User, Info } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
    useGetBankApiV1BanksBankIdGet,
    useShareBankApiV1BanksBankIdSharePost,
    useUnshareBankApiV1BanksBankIdUnsharePost,
} from "@/api/generated/banks/banks";
import { BankPermission } from "@/api/generated/model/bankPermission";

interface BankShareDialogProps {
    bankId: string;
    bankName: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function BankShareDialog({ bankId, bankName, open, onOpenChange }: BankShareDialogProps) {
    const [newUserEmail, setNewUserEmail] = useState(""); // Using email/ID placeholder
    const [newPermission, setNewPermission] = useState<BankPermission>(BankPermission.read);

    const { data, isLoading, refetch } = useGetBankApiV1BanksBankIdGet(bankId, {
        query: { enabled: open },
    });

    const { mutate: shareBank, isPending: isSharing } = useShareBankApiV1BanksBankIdSharePost({
        mutation: {
            onSuccess: () => {
                toast.success("Bank shared successfully");
                setNewUserEmail("");
                refetch();
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onError: (error: any) => {
                toast.error(error?.response?.data?.message || "Failed to share bank");
            },
        },
    });

    const { mutate: unshareBank, isPending: isUnsharing } =
        useUnshareBankApiV1BanksBankIdUnsharePost({
            mutation: {
                onSuccess: () => {
                    toast.success("Access revoked");
                    refetch();
                },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onError: (error: any) => {
                    toast.error(error?.response?.data?.message || "Failed to revoke access");
                },
            },
        });

    const handleAddShare = () => {
        if (!newUserEmail) return;
        shareBank({
            bankId,
            data: {
                shares: [{ user_id: newUserEmail, permission: newPermission }],
            },
        });
    };

    const handleRemoveShare = (userId: string) => {
        unshareBank({
            bankId,
            data: { user_ids: [userId] },
        });
    };

    const handleUpdatePermission = (userId: string, permission: BankPermission) => {
        shareBank({
            bankId,
            data: {
                shares: [{ user_id: userId, permission }],
            },
        });
    };

    const shares = data?.data?.shares || [];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px] border-white/10 bg-[#0f1117] text-white p-0 overflow-hidden">
                <div className="p-6 pb-0">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            <Shield className="h-6 w-6 text-primary" />
                            Manage Access
                        </DialogTitle>
                        <DialogDescription className="text-white/60">
                            Control who can view or edit{" "}
                            <span className="text-white font-medium">&quot;{bankName}&quot;</span>.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-6 flex items-end gap-3">
                        <div className="flex-1 space-y-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider text-white/40 ml-1">
                                User ID (UUID)
                            </label>
                            <Input
                                placeholder="Paste user UUID..."
                                className="border-white/10 bg-white/5 focus-visible:ring-primary/50"
                                value={newUserEmail}
                                onChange={(e) => setNewUserEmail(e.target.value)}
                            />
                        </div>
                        <div className="w-[120px] space-y-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider text-white/40 ml-1">
                                Role
                            </label>
                            <Select
                                value={newPermission}
                                onValueChange={(v) => setNewPermission(v as BankPermission)}
                            >
                                <SelectTrigger className="border-white/10 bg-white/5">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="border-white/10 bg-[#161922] text-white">
                                    <SelectItem value="read">Viewer</SelectItem>
                                    <SelectItem value="edit">Editor</SelectItem>
                                    <SelectItem value="owner">Owner</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            onClick={handleAddShare}
                            disabled={!newUserEmail || isSharing}
                            className="h-10 px-4"
                        >
                            {isSharing ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <UserPlus className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>

                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-semibold text-white/80">Users with access</h4>
                        <Badge
                            variant="outline"
                            className="text-[10px] uppercase border-white/10 text-white/40"
                        >
                            {shares.length} {shares.length === 1 ? "User" : "Users"}
                        </Badge>
                    </div>

                    <ScrollArea className="h-[280px] pr-4">
                        {isLoading ? (
                            <div className="flex h-full items-center justify-center">
                                <Loader2 className="h-6 w-6 animate-spin text-primary/50" />
                            </div>
                        ) : shares.length > 0 ? (
                            <div className="space-y-4">
                                {shares.map((share) => (
                                    <div
                                        key={share.user_id}
                                        className="flex items-center justify-between group"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                                <User className="h-4 w-4 text-white/40" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-white truncate max-w-[200px]">
                                                    {share.user_id}
                                                </p>
                                                <p className="text-[10px] text-white/40 uppercase tracking-tighter">
                                                    UUID
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Select
                                                value={share.permission}
                                                onValueChange={(v) =>
                                                    handleUpdatePermission(
                                                        share.user_id,
                                                        v as BankPermission,
                                                    )
                                                }
                                                disabled={isSharing}
                                            >
                                                <SelectTrigger className="h-8 w-[100px] text-xs border-transparent bg-transparent hover:bg-white/5">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="border-white/10 bg-[#161922] text-white">
                                                    <SelectItem value="read">Viewer</SelectItem>
                                                    <SelectItem value="edit">Editor</SelectItem>
                                                    <SelectItem value="owner">Owner</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-white/20 hover:text-red-400 hover:bg-red-500/10"
                                                onClick={() => handleRemoveShare(share.user_id)}
                                                disabled={isUnsharing}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center p-8 border border-dashed border-white/5 rounded-xl bg-white/[0.02]">
                                <Info className="h-8 w-8 text-white/10 mb-2" />
                                <p className="text-sm text-white/30">No users shared yet.</p>
                            </div>
                        )}
                    </ScrollArea>
                </div>

                <Separator className="bg-white/5" />
                <div className="p-4 bg-white/[0.02] flex justify-end">
                    <Button
                        variant="ghost"
                        className="text-white/60 hover:text-white"
                        onClick={() => onOpenChange(false)}
                    >
                        Done
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
