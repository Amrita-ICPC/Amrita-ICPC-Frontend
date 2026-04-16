import { AuthGuard } from "@/components/auth/auth-guard";
import { CreateTeamForm } from "@/components/instructor/create-team-form";

export default function CreateTeamPage() {
    return (
        <AuthGuard requiredRoles={["instructor", "admin"]} redirectTo="/dashboard">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Create Team</h1>
                    <p className="text-gray-600">Create a new team for this contest</p>
                </div>
                <CreateTeamForm />
            </div>
        </AuthGuard>
    );
}
