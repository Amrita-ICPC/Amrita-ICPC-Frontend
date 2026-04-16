import { AuthGuard } from "@/components/auth/auth-guard";
import { EditTeamForm } from "@/components/instructor/edit-team-form";

export default function EditTeamPage() {
    return (
        <AuthGuard requiredRoles={["instructor", "admin"]} redirectTo="/dashboard">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Edit Team</h1>
                    <p className="text-gray-600">Update team information</p>
                </div>
                <EditTeamForm />
            </div>
        </AuthGuard>
    );
}
