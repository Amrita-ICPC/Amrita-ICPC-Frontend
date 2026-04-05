import AuthGuard from "@/components/auth/AuthGuard";

export default function StudentPage() {
    return (
        <AuthGuard requiredRoles={["STUDENT"]}>
            <div className="p-6 bg-green-900/10 border border-green-500 rounded-lg">
                <h2 className="text-2xl font-bold text-green-500">Student Area</h2>
                <p>Active contest participation arena.</p>
            </div>
        </AuthGuard>
    );
}
