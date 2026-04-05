import AuthGuard from "@/components/auth/AuthGuard";

export default function CoachPage() {
    return (
        <AuthGuard requiredRoles={["COACH"]}>
            <div className="p-6 bg-blue-900/10 border border-blue-500 rounded-lg">
                <h2 className="text-2xl font-bold text-blue-500">Coach View</h2>
                <p>Team monitoring and grading overrides.</p>
            </div>
        </AuthGuard>
    );
}
