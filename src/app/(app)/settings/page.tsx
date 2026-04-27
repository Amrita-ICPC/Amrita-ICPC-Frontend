import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { ShieldCheck, UserCircle2, KeyRound, Mail, IdCard, UsersRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function initials(name?: string | null, email?: string | null) {
    const seed = name || email || "U";
    const parts = seed.split(" ").filter(Boolean);
    return parts.length > 1
        ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
        : seed.slice(0, 2).toUpperCase();
}

export default async function SettingsPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/login");
    }

    const user = session.user;
    const fullName = user.name || "ICPC User";
    const email = user.email || "Not available";
    const userId = user.id || "Not available";

    const permissions = [...new Set([...(user.groups ?? []), ...(user.roles ?? [])])];

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            <section className="rounded-2xl border border-[#203a80]/35 bg-linear-to-r from-[#18326e] to-[#13285e] px-6 py-5 text-white shadow-[0_20px_38px_-22px_rgba(13,30,74,0.9)] dark:border-white/12 dark:from-[#112554] dark:to-[#0f214d]">
                <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-white/14">
                        <ShieldCheck className="h-4.5 w-4.5" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                        <p className="mt-1 text-sm text-blue-100/90">
                            Manage your profile and account security.
                        </p>
                    </div>
                </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_18px_36px_-28px_rgba(18,43,102,0.7)]">
                <div className="flex items-center gap-2 border-b border-[#203a80]/25 bg-[#13285e] px-5 py-3 text-white dark:border-white/10 dark:bg-[#0f214d]">
                    <UserCircle2 className="h-4.5 w-4.5" />
                    <h2 className="text-sm font-semibold tracking-wide">Profile</h2>
                </div>

                <div className="space-y-6 p-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                            {initials(fullName, email)}
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground">
                                {fullName}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">{email}</p>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                <UserCircle2 className="h-3.5 w-3.5" />
                                Display Name
                            </label>
                            <Input value={fullName} readOnly className="bg-muted/45" />
                        </div>

                        <div className="space-y-1.5">
                            <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                <Mail className="h-3.5 w-3.5" />
                                Email
                            </label>
                            <Input value={email} readOnly className="bg-muted/45" />
                        </div>

                        <div className="space-y-1.5 sm:col-span-2">
                            <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                <IdCard className="h-3.5 w-3.5" />
                                User ID
                            </label>
                            <Input value={userId} readOnly className="bg-muted/45" />
                        </div>
                    </div>
                </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_18px_36px_-28px_rgba(18,43,102,0.7)]">
                <div className="flex items-center gap-2 border-b border-[#203a80]/25 bg-[#13285e] px-5 py-3 text-white dark:border-white/10 dark:bg-[#0f214d]">
                    <UsersRound className="h-4.5 w-4.5" />
                    <h2 className="text-sm font-semibold tracking-wide">Access Summary</h2>
                </div>

                <div className="space-y-4 p-5">
                    <div>
                        <p className="mb-2 text-xs font-medium text-muted-foreground">
                            Groups & Permissions
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {permissions.length > 0 ? (
                                permissions.map((perm) => (
                                    <Badge
                                        key={perm}
                                        variant="secondary"
                                        className="border border-border bg-muted/70 text-foreground"
                                    >
                                        {perm}
                                    </Badge>
                                ))
                            ) : (
                                <span className="text-sm text-muted-foreground">
                                    No role metadata found.
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="rounded-lg border border-border bg-muted/35 p-4">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-sm font-semibold text-foreground">
                                    Password & Account Security
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Authentication is managed by SSO. Contact your administrator for
                                    credential updates.
                                </p>
                            </div>
                            <Button variant="secondary" size="sm" disabled>
                                <KeyRound className="h-3.5 w-3.5" />
                                Managed by SSO
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
