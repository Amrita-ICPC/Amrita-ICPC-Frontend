import AuthGuard from "@/components/auth/AuthGuard";

export default function AdminPage() {
    return (
        <AuthGuard requiredRoles={["ADMIN"]}>
            <div className="p-6 bg-red-900/10 border border-red-500 rounded-lg">
                <h2 className="text-2xl font-bold text-red-500">Admin Controls</h2>
                <p>Welcome to the global administrative dashboard.</p>
            </div>
        </AuthGuard>
    );
}
