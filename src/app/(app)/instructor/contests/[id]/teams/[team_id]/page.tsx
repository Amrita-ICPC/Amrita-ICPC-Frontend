import { AuthGuard } from "@/components/auth/auth-guard";
import { TeamDetail } from "@/components/instructor/team-detail";

export default function TeamDetailPage() {
    return (
        <AuthGuard requiredRoles={["instructor", "admin"]} redirectTo="/dashboard">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Team Details</h1>
                    <p className="text-gray-600">View and manage team information</p>
                </div>
                <TeamDetail />
            </div>
        </AuthGuard>
    );
}
