"use client";

import { useContestLeaderboard, useContestStats } from "@/query/use-leaderboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface LeaderboardProps {
    contestId: string;
}

export function Leaderboard({ contestId }: LeaderboardProps) {
    const { data: leaderboard, isLoading: isLoadingLeaderboard } = useContestLeaderboard(contestId);
    const { data: stats, isLoading: isLoadingStats } = useContestStats(contestId);

    if (isLoadingLeaderboard || isLoadingStats) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Statistics */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Participants</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_participants}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_submissions}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.avg_score.toFixed(1)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Highest Score</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.highest_score}</div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Standings */}
            <Card>
                <CardHeader>
                    <CardTitle>Standings</CardTitle>
                    <CardDescription>Real-time contest leaderboard</CardDescription>
                </CardHeader>
                <CardContent>
                    {leaderboard?.standings && leaderboard.standings.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-3 text-left font-semibold text-gray-700">
                                            Rank
                                        </th>
                                        <th className="px-6 py-3 text-left font-semibold text-gray-700">
                                            User
                                        </th>
                                        <th className="px-6 py-3 text-left font-semibold text-gray-700">
                                            Score
                                        </th>
                                        <th className="px-6 py-3 text-left font-semibold text-gray-700">
                                            Problems
                                        </th>
                                        <th className="px-6 py-3 text-left font-semibold text-gray-700">
                                            Penalty Time
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaderboard.standings.map((entry) => (
                                        <tr
                                            key={entry.user_id}
                                            className="border-b hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-3 font-semibold">
                                                #{entry.rank}
                                            </td>
                                            <td className="px-6 py-3">{entry.user_name}</td>
                                            <td className="px-6 py-3 font-bold text-lg">
                                                {entry.score}
                                            </td>
                                            <td className="px-6 py-3">{entry.problems_solved}</td>
                                            <td className="px-6 py-3">
                                                {Math.floor(entry.total_time / 60)}:
                                                {String(entry.total_time % 60).padStart(2, "0")}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-8 text-center text-gray-500">No submissions yet</div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
