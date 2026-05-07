"use client";

import { useState } from "react";
import {
    Users,
    Search,
    UserPlus,
    Trash2,
    ShieldAlert,
    Loader2,
    X,
    Check,
    Mail,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    useGetBankShares,
    useShareBank,
    useUnshareBank,
    useUpdateBankShares,
    bankSharesKey,
    bankDetailKey,
} from "@/query/bank-query";
import { useListUsersApiV1UsersGet as useListUsers } from "@/api/generated/users/users";
import { useDebounce } from "@/hooks/use-debounce";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    APIResponseListUserResponse,
    BankPermission,
    BankShareItem,
    BankSharesResponse,
    BankShareUserResponse,
    UserBasicInfo,
} from "@/api/generated/model";
import { AsyncStateHandler } from "../shared/async-state-handler";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface BankShareDialogProps {
    bankId: string;
    bankName: string;
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function BankShareDialog({
    bankId,
    bankName,
    trigger,
    open: controlledOpen,
    onOpenChange: setControlledOpen,
}: BankShareDialogProps) {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
    const open = controlledOpen ?? uncontrolledOpen;
    const setOpen = setControlledOpen ?? setUncontrolledOpen;

    const [userSearch, setUserSearch] = useState("");
    const debouncedSearch = useDebounce(userSearch, 500);
    const [pendingPermissions, setPendingPermissions] = useState<Record<string, BankPermission>>(
        {},
    );
    const queryClient = useQueryClient();

    const {
        data: sharesData,
        isLoading: isLoadingShares,
        error: sharesError,
        refetch: refetchShares,
    } = useGetBankShares(bankId, undefined, { query: { enabled: open } });

    const {
        data: usersData,
        isLoading: isLoadingUsers,
        isError: isErrorUsers,
        error: errorUsers,
        refetch: refetchUsers,
    } = useListUsers(
        { q: debouncedSearch || undefined, page_size: 5 },
        { query: { enabled: open && debouncedSearch.length >= 2 } },
    );

    const shareMutation = useShareBank({
        mutation: {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: bankSharesKey(bankId) });
                queryClient.invalidateQueries({ queryKey: bankDetailKey(bankId) });
                setUserSearch("");
                toast.success("Bank shared successfully");
            },
        },
    });

    const unshareMutation = useUnshareBank({
        mutation: {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: bankSharesKey(bankId) });
                queryClient.invalidateQueries({ queryKey: bankDetailKey(bankId) });
                toast.success("User removed from bank");
            },
        },
    });

    const updateMutation = useUpdateBankShares({
        mutation: {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: bankSharesKey(bankId) });
                queryClient.invalidateQueries({ queryKey: bankDetailKey(bankId) });
                setPendingPermissions({});
                toast.success("Permissions updated");
            },
        },
    });

    const shares = sharesData?.data;
    const owner = shares?.owner;
    const sharedUsers = ((shares as BankSharesResponse)?.shares ?? []).filter(
        (s: any) => s.id !== owner?.id,
    );
    const foundUsers = (usersData as APIResponseListUserResponse)?.data ?? [];
    const hasPendingChanges = Object.keys(pendingPermissions).length > 0;

    const handleShare = (userId: string) => {
        shareMutation.mutate({
            bankId,
            data: {
                shares: [{ user_id: userId, permission: BankPermission.read }],
            },
        });
    };

    const handleUnshare = (shareId: string) => {
        unshareMutation.mutate({
            bankId,
            targetUserId: shareId,
        });
    };

    const handleUpdatePermission = (userId: string, permission: BankPermission) => {
        setPendingPermissions((prev) => ({
            ...prev,
            [userId]: permission,
        }));
    };

    const handleSavePermissions = () => {
        const updates: BankShareItem[] = Object.entries(pendingPermissions).map(
            ([id, permission]) => ({
                user_id: id,
                permission: permission,
            }),
        );

        if (updates.length === 0) return;

        updateMutation.mutate({
            bankId,
            data: updates,
        });
    };

    const getInitials = (name: string) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {trigger !== null && (
                <DialogTrigger asChild>
                    {trigger || (
                        <Button
                            variant="outline"
                            className="h-10 bg-background/50 backdrop-blur-sm border-border/60"
                        >
                            <Users className="mr-2 h-4 w-4" />
                            Manage Access
                        </Button>
                    )}
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none bg-transparent shadow-2xl">
                <div className="bg-card/95 backdrop-blur-xl border border-border/60 rounded-2xl overflow-hidden shadow-2xl">
                    <DialogHeader className="p-6 pb-4 border-b border-border/10 bg-muted/20">
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            Manage Access
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground/80">
                            Share <span className="font-semibold text-foreground">{bankName}</span>{" "}
                            with your team.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-6 space-y-6">
                        {/* User Search Section */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">
                                Add Collaborators
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                                <Input
                                    placeholder="Search by name or email..."
                                    className="pl-9 h-11 bg-muted/30 border-border/40 focus:bg-background transition-all"
                                    value={userSearch}
                                    onChange={(e) => setUserSearch(e.target.value)}
                                />
                                {isLoadingUsers && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <Loader2 className="h-4 w-4 animate-spin text-primary/60" />
                                    </div>
                                )}
                            </div>

                            {/* Search Results */}
                            {userSearch.length >= 2 && (
                                <AsyncStateHandler
                                    isError={isErrorUsers}
                                    error={errorUsers}
                                    onRetry={refetchUsers}
                                    inline
                                >
                                    {foundUsers.length > 0 && (
                                        <div className="mt-2 rounded-xl border border-border/40 bg-background/50 backdrop-blur-md overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 shadow-lg">
                                            {foundUsers.map((user: any) => {
                                                const isOwner = owner?.id === user.id;
                                                const isShared = sharedUsers.some(
                                                    (su: any) => su.user_id === user.id,
                                                );
                                                const canShare = !isOwner && !isShared;

                                                return (
                                                    <div
                                                        key={user.id}
                                                        className="flex items-center justify-between p-3 hover:bg-muted/30 transition-colors border-b last:border-0 border-border/5"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-8 w-8 border border-border/40">
                                                                <AvatarImage
                                                                    src={user.profile_image}
                                                                />
                                                                <AvatarFallback className="bg-primary/5 text-[10px] text-primary font-bold">
                                                                    {getInitials(
                                                                        user.name || user.username,
                                                                    )}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex flex-col min-w-0">
                                                                <span className="text-sm font-semibold truncate max-w-[150px]">
                                                                    {user.name || user.username}
                                                                </span>
                                                                <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                                                                    {user.email}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        {canShare ? (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-8 px-2 text-primary hover:bg-primary/10"
                                                                onClick={() => handleShare(user.id)}
                                                                disabled={shareMutation.isPending}
                                                            >
                                                                {shareMutation.isPending ? (
                                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                                ) : (
                                                                    <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                                                                )}
                                                                Share
                                                            </Button>
                                                        ) : (
                                                            <Badge
                                                                variant="outline"
                                                                className="text-[10px] bg-muted/50 border-none"
                                                            >
                                                                {isOwner ? "Owner" : "Added"}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </AsyncStateHandler>
                            )}
                        </div>

                        {/* Shared Users List */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">
                                Who has access
                            </label>

                            <AsyncStateHandler
                                isLoading={isLoadingShares}
                                isError={!!sharesError}
                                error={sharesError}
                                onRetry={refetchShares}
                            >
                                <ScrollArea className="h-[280px] pr-4 -mr-4">
                                    <div className="space-y-3">
                                        {/* Owner */}
                                        {owner && (
                                            <div className="flex items-center justify-between p-3 rounded-xl border border-primary/10 bg-primary/5 shadow-sm">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9 border-2 border-primary/20">
                                                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                                            {getInitials(owner.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold flex items-center gap-1.5">
                                                            {owner.name}
                                                            <ShieldAlert className="h-3.5 w-3.5 text-primary" />
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                            <Mail className="h-2.5 w-2.5" />
                                                            {owner.email}
                                                        </span>
                                                    </div>
                                                </div>
                                                <Badge className="bg-primary/20 text-primary border-none text-[10px] uppercase tracking-wider font-bold h-6">
                                                    Owner
                                                </Badge>
                                            </div>
                                        )}

                                        {/* Shared Users */}
                                        {sharedUsers.map((share: BankShareUserResponse) => (
                                            <div
                                                key={share.id}
                                                className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-card/40 hover:bg-card transition-all group shadow-sm"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9 border border-border/60">
                                                        <AvatarFallback className="bg-muted text-muted-foreground font-bold">
                                                            {getInitials(share.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-semibold">
                                                            {share.name}
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                                                            {share.email}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Select
                                                        value={
                                                            pendingPermissions[share.id] ||
                                                            share.permission
                                                        }
                                                        onValueChange={(val) =>
                                                            handleUpdatePermission(
                                                                share.id,
                                                                val as BankPermission,
                                                            )
                                                        }
                                                        disabled={updateMutation.isPending}
                                                    >
                                                        <SelectTrigger className="h-8 w-[80px] text-[10px] font-bold bg-muted/30 border-none focus:ring-0 px-2 shadow-none rounded-lg">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-card/95 backdrop-blur-xl border-border/40 min-w-[100px]">
                                                            <SelectItem
                                                                value={BankPermission.read}
                                                                className="text-[10px] font-medium"
                                                            >
                                                                Read
                                                            </SelectItem>
                                                            <SelectItem
                                                                value={BankPermission.edit}
                                                                className="text-[10px] font-medium"
                                                            >
                                                                Edit
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>

                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors opacity-0 group-hover:opacity-100 rounded-lg"
                                                        onClick={() => handleUnshare(share.id)}
                                                        disabled={unshareMutation.isPending}
                                                    >
                                                        {unshareMutation.isPending ? (
                                                            <Loader2 className="h-3 w-3 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}

                                        {sharedUsers.length === 0 && !isLoadingShares && (
                                            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground/40 border border-dashed border-border/40 rounded-xl bg-muted/5">
                                                <Users className="h-10 w-10 mb-2 opacity-20" />
                                                <p className="text-xs font-medium italic">
                                                    No other collaborators
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </AsyncStateHandler>
                        </div>
                    </div>

                    <div className="p-4 bg-muted/30 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            {hasPendingChanges && (
                                <Button
                                    size="sm"
                                    className="h-8 text-[11px] font-bold shadow-lg shadow-primary/20 animate-in zoom-in-95 duration-200"
                                    onClick={handleSavePermissions}
                                    disabled={updateMutation.isPending}
                                >
                                    {updateMutation.isPending ? (
                                        <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                                    ) : (
                                        <Check className="h-3.5 w-3.5 mr-1.5" />
                                    )}
                                    Save Changes
                                </Button>
                            )}
                        </div>
                        <Button
                            variant="secondary"
                            size="sm"
                            className="h-8 text-[11px] font-bold uppercase tracking-wider rounded-lg"
                            onClick={() => {
                                setOpen(false);
                                setPendingPermissions({});
                            }}
                        >
                            Done
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
