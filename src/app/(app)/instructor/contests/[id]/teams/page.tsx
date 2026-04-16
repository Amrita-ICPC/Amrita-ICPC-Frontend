import { AuthGuard } from "@/components/auth/auth-guard";
import { TeamsList } from "@/components/instructor/teams-list";

export default function TeamsPage() {
    return (
        <AuthGuard requiredRoles={["instructor", "admin"]} redirectTo="/dashboard">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Teams</h1>
                    <p className="text-gray-600">Manage teams for this contest</p>
                </div>
                <TeamsList />
            </div>
        </AuthGuard>
    );
}
