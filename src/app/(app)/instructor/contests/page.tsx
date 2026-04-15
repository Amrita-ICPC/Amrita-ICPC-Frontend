"use client";

/**
 * Instructor contests management page
 * Instructor-only role protection with contest creation and editing
 */

import { useState } from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { ContestsTable } from "@/components/instructor/contests-table";
import { ContestFormModal } from "@/components/instructor/contest-form-modal";
import { Contest } from "@/services/contests";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

function ContestsPageContent() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedContest, setSelectedContest] = useState<Contest | null>(null);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Contests Management</h1>
                    <p className="text-gray-600 mt-1">Create and manage programming contests</p>
                </div>
                <Button
                    onClick={() => {
                        setSelectedContest(null);
                        setIsCreateModalOpen(true);
                    }}
                    className="gap-2"
                >
                    <Plus className="w-4 h-4" />
                    New Contest
                </Button>
            </div>

            <ContestsTable
                onEdit={(contest) => {
                    setSelectedContest(contest);
                    setIsCreateModalOpen(true);
                }}
            />

            <ContestFormModal
                isOpen={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setSelectedContest(null);
                }}
                contest={selectedContest}
            />
        </div>
    );
}

export default function ContestsPage() {
    return (
        <AuthGuard requiredRoles={["instructor"]} redirectTo="/dashboard">
            <ContestsPageContent />
        </AuthGuard>
    );
}
