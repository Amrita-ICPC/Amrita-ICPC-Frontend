"use client";

/**
 * Admin users management page
 * Admin-only role protection with breadcrumbs and user details
 */

import { useState } from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { UsersTable } from "@/components/admin/users-table";
import { UserProfile } from "@/services/users";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

function UsersPageContent() {
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

    if (selectedUser) {
        return (
            <div className="space-y-4">
                <Button variant="ghost" onClick={() => setSelectedUser(null)} className="gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back to list
                </Button>

                <Card className="p-6">
                    <h2 className="text-xl font-bold mb-4">User Details</h2>
                    <dl className="space-y-3">
                        <div className="flex justify-between">
                            <dt className="font-semibold text-gray-600">Email</dt>
                            <dd className="text-gray-900">{selectedUser.email}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="font-semibold text-gray-600">Name</dt>
                            <dd className="text-gray-900">{selectedUser.name || "—"}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="font-semibold text-gray-600">Roles</dt>
                            <dd className="text-gray-900">
                                {selectedUser.roles?.join(", ") || "—"}
                            </dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="font-semibold text-gray-600">Created</dt>
                            <dd className="text-gray-900">
                                {selectedUser.created_at
                                    ? new Date(selectedUser.created_at).toLocaleDateString()
                                    : "—"}
                            </dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="font-semibold text-gray-600">Updated</dt>
                            <dd className="text-gray-900">
                                {selectedUser.updated_at
                                    ? new Date(selectedUser.updated_at).toLocaleDateString()
                                    : "—"}
                            </dd>
                        </div>
                    </dl>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-3xl font-bold">Users Management</h1>
                <p className="text-gray-600 mt-1">Manage platform users and their roles</p>
            </div>

            <UsersTable onUserSelect={setSelectedUser} />
        </div>
    );
}

export default function UsersPage() {
    return (
        <AuthGuard requiredRoles={["admin"]} redirectTo="/dashboard">
            <UsersPageContent />
        </AuthGuard>
    );
}
