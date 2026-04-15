"use client";

/**
 * User profile page
 * Displays current logged-in user's profile information
 * Accessible to all authenticated users
 */

import { AuthGuard } from "@/components/auth/auth-guard";
import { useCurrentUser } from "@/query/use-users";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { format } from "date-fns";

function ProfileContent() {
    const { data: user, isLoading, error } = useCurrentUser();

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/3" />
                <Card className="p-6 space-y-4">
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-6 w-2/5" />
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    Failed to load profile. Please try refreshing the page.
                </AlertDescription>
            </Alert>
        );
    }

    if (!user) {
        return (
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>No profile data available.</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">My Profile</h1>
                <p className="text-gray-600 mt-1">View your account information</p>
            </div>

            <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">Account Information</h2>

                <div className="space-y-6">
                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                            Email
                        </label>
                        <p className="text-lg text-gray-900">{user.email}</p>
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">Name</label>
                        <p className="text-lg text-gray-900">{user.name || "—"}</p>
                    </div>

                    {/* User ID */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                            User ID
                        </label>
                        <p className="font-mono text-sm text-gray-700">{user.id}</p>
                    </div>

                    {/* Roles */}
                    {user.roles && user.roles.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                Roles
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {user.roles.map((role) => (
                                    <Badge key={role} variant="secondary">
                                        {role}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Groups */}
                    {user.groups && user.groups.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                Groups
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {user.groups.map((group) => (
                                    <Badge key={group} variant="outline">
                                        {group}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Created At */}
                    {user.created_at && (
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                Member Since
                            </label>
                            <p className="text-lg text-gray-900">
                                {format(new Date(user.created_at), "MMM dd, yyyy")}
                            </p>
                        </div>
                    )}

                    {/* Updated At */}
                    {user.updated_at && (
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                Last Updated
                            </label>
                            <p className="text-lg text-gray-900">
                                {format(new Date(user.updated_at), "MMM dd, yyyy 'at' HH:mm")}
                            </p>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}

export default function ProfilePage() {
    return (
        <AuthGuard requiredRoles={["admin", "instructor", "student"]} redirectTo="/auth/login">
            <ProfileContent />
        </AuthGuard>
    );
}
