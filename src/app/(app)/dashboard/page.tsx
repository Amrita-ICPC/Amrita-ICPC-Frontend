import { auth } from "@/lib/auth/auth";

export default async function DashboardPage() {
    const session = await auth();
    const roles = session?.user?.roles ?? [];
    const groups = session?.user?.groups ?? [];
    const permissions = session?.user?.permissions ?? [];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold">Dashboard</h1>

            <section className="rounded-xl border border-white/10 bg-white/5 p-5">
                <h2 className="mb-3 text-lg font-medium">Auth Claims Check</h2>
                <p className="mb-4 text-sm text-white/70">
                    Use this block to verify what came from Keycloak in your current session.
                </p>

                <div className="grid gap-4 md:grid-cols-3">
                    <div>
                        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-white/70">
                            Roles
                        </h3>
                        <pre className="overflow-x-auto rounded-md bg-black/30 p-3 text-xs text-white/90">
                            {JSON.stringify(roles, null, 2)}
                        </pre>
                    </div>

                    <div>
                        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-white/70">
                            Groups
                        </h3>
                        <pre className="overflow-x-auto rounded-md bg-black/30 p-3 text-xs text-white/90">
                            {JSON.stringify(groups, null, 2)}
                        </pre>
                    </div>

                    <div>
                        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-white/70">
                            Permissions
                        </h3>
                        <pre className="overflow-x-auto rounded-md bg-black/30 p-3 text-xs text-white/90">
                            {JSON.stringify(permissions, null, 2)}
                        </pre>
                    </div>
                </div>
            </section>
        </div>
    );
}
