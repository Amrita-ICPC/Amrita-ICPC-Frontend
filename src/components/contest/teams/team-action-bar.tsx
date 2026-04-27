"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { CreateEditTeamDialog } from "./create-edit-team-dialog";

interface TeamActionBarProps {
    search: string;
    onSearchChange: (search: string) => void;
    approvalStatus: "approved" | "pending" | "all";
    onApprovalStatusChange: (status: "approved" | "pending" | "all") => void;
    teamStatus: "all" | "DRAFT" | "CONFIRMED";
    onTeamStatusChange: (status: "all" | "DRAFT" | "CONFIRMED") => void;
    contestId: string;
}

export function TeamActionBar({
    search,
    onSearchChange,
    approvalStatus,
    onApprovalStatusChange,
    teamStatus,
    onTeamStatusChange,
    contestId,
}: TeamActionBarProps) {
    const [isCreateOpen, setCreateOpen] = useState(false);

    return (
        <>
            <div className="flex items-center gap-2 mb-6">
                <Input
                    placeholder="Search by team name..."
                    className="flex-1"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
                <Select value={teamStatus} onValueChange={onTeamStatusChange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={approvalStatus} onValueChange={onApprovalStatusChange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by approval" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Approvals</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                </Select>
                <Button onClick={() => setCreateOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Team
                </Button>
            </div>
            <CreateEditTeamDialog
                isOpen={isCreateOpen}
                onOpenChange={setCreateOpen}
                contestId={contestId}
            />
        </>
    );
}
