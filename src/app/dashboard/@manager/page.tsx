import AuthGuard from "@/components/auth/AuthGuard";

export default function ManagerPage() {
    return (
        <AuthGuard requiredRoles={["MANAGER"]}>
            <div className="p-6 bg-orange-900/10 border border-orange-500 rounded-lg">
                <h2 className="text-2xl font-bold text-orange-500">Manager Dashboard</h2>
                <p>Oversight controls for Room and Bank management.</p>
            </div>
        </AuthGuard>
    );
}
