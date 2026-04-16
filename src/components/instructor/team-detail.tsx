"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useTeam, useTeamMembers, useRemoveTeamMember, useDeleteTeam } from "@/query/use-teams";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Edit2, Trash2, UserMinus } from "lucide-react";
import { TeamMemberManager } from "./team-member-manager";

export function TeamDetail() {
    const router = useRouter();
    const params = useParams();
    const contestId = params?.id as string;
    const teamId = params?.["team_id"] as string;

    const [deleteTeamId, setDeleteTeamId] = useState<string | null>(null);
    const [removeMemberId, setRemoveMemberId] = useState<string | null>(null);
    const [showMemberManager, setShowMemberManager] = useState(false);

    const { data: team, isLoading: isTeamLoading } = useTeam(contestId, teamId);
    const { data: members, isLoading: isMembersLoading } = useTeamMembers(contestId, teamId);
    const { mutate: removeTeamMember, isPending: isRemoving } = useRemoveTeamMember(
        contestId,
        teamId,
    );
    const { mutate: deleteTeam, isPending: isDeleting } = useDeleteTeam(contestId);

    if (isTeamLoading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </CardContent>
            </Card>
        );
    }

    if (!team) {
        return (
            <Card>
                <CardContent className="py-8 text-center text-red-600">Team not found</CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                    <div>
                        <CardTitle className="text-2xl">{team.name}</CardTitle>
                        <CardDescription>{team.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                router.push(
                                    `/instructor/contests/${contestId}/teams/${teamId}/edit`,
                                )
                            }
                            className="gap-2"
                        >
                            <Edit2 className="h-4 w-4" />
                            Edit
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeleteTeamId(teamId)}
                            className="gap-2"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Status</p>
                            <Badge variant={team.approved ? "default" : "secondary"}>
                                {team.approved ? "Approved" : "Pending"}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Members</p>
                            <p className="text-lg font-semibold">{members?.length || 0}</p>
                        </div>
                        {team.created_by && (
                            <div>
                                <p className="text-sm text-gray-600">Created By</p>
                                <p className="font-medium">{team.created_by}</p>
                            </div>
                        )}
                        {team.created_at && (
                            <div>
                                <p className="text-sm text-gray-600">Created</p>
                                <p className="font-medium">
                                    {new Date(team.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div>
                        <CardTitle>Team Members</CardTitle>
                        <CardDescription>Manage team members</CardDescription>
                    </div>
                    <Button onClick={() => setShowMemberManager(true)} size="sm">
                        Add Member
                    </Button>
                </CardHeader>
                <CardContent>
                    {isMembersLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : members && members.length > 0 ? (
                        <div className="rounded-md border overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-3 text-left font-semibold text-gray-700">
                                            User ID
                                        </th>
                                        <th className="px-6 py-3 text-left font-semibold text-gray-700">
                                            User Name
                                        </th>
                                        <th className="px-6 py-3 text-left font-semibold text-gray-700">
                                            Joined
                                        </th>
                                        <th className="px-6 py-3 text-left font-semibold text-gray-700">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {members.map((member) => (
                                        <tr key={member.id} className="border-b hover:bg-gray-50">
                                            <td className="px-6 py-3 font-mono text-xs">
                                                {member.user_id}
                                            </td>
                                            <td className="px-6 py-3">{member.user_name || "-"}</td>
                                            <td className="px-6 py-3">
                                                {member.joined_at
                                                    ? new Date(
                                                          member.joined_at,
                                                      ).toLocaleDateString()
                                                    : "-"}
                                            </td>
                                            <td className="px-6 py-3">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setRemoveMemberId(member.id)}
                                                    className="gap-2 text-red-600 hover:text-red-700"
                                                >
                                                    <UserMinus className="h-4 w-4" />
                                                    Remove
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-8 text-center text-gray-500">No members yet</div>
                    )}
                </CardContent>
            </Card>

            {showMemberManager && (
                <TeamMemberManager
                    contestId={contestId}
                    teamId={teamId}
                    onClose={() => setShowMemberManager(false)}
                />
            )}

            <AlertDialog open={!!deleteTeamId} onOpenChange={() => setDeleteTeamId(null)}>
                <AlertDialogContent>
                    <AlertDialogTitle>Delete Team</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete this team? This action cannot be undone.
                    </AlertDialogDescription>
                    <div className="flex gap-4">
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (deleteTeamId) {
                                    deleteTeam(deleteTeamId, {
                                        onSuccess: () => {
                                            setDeleteTeamId(null);
                                            router.push(`/instructor/contests/${contestId}/teams`);
                                        },
                                    });
                                }
                            }}
                            disabled={isDeleting}
                            className="gap-2 bg-red-600 hover:bg-red-700"
                        >
                            {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
                            Delete
                        </AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={!!removeMemberId} onOpenChange={() => setRemoveMemberId(null)}>
                <AlertDialogContent>
                    <AlertDialogTitle>Remove Member</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to remove this member from the team?
                    </AlertDialogDescription>
                    <div className="flex gap-4">
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (removeMemberId) {
                                    removeTeamMember(removeMemberId, {
                                        onSuccess: () => setRemoveMemberId(null),
                                    });
                                }
                            }}
                            disabled={isRemoving}
                            className="gap-2 bg-red-600 hover:bg-red-700"
                        >
                            {isRemoving && <Loader2 className="h-4 w-4 animate-spin" />}
                            Remove
                        </AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
