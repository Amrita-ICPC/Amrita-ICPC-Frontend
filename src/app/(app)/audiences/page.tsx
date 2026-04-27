import { AudiencesClient } from "@/components/audiences/audiences-client";

export default function AudiencesPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Manage Users</h1>
                <p className="text-sm text-muted-foreground">Create and manage audience groups.</p>
            </div>
            <AudiencesClient />
        </div>
    );
}
