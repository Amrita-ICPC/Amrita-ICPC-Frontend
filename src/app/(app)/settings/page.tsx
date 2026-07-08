import {
    BadgeCheck,
    IdCard,
    KeyRound,
    Mail,
    ShieldCheck,
    UserCircle2,
    UsersRound,
} from "lucide-react";
import { redirect } from "next/navigation";

import { AppearanceSection } from "@/components/settings/appearance-section";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth/auth";
import { getDefaultRoute } from "@/lib/auth/utils";
import { cn } from "@/lib/utils";

function initials(name?: string | null, email?: string | null) {
    const seed = name || email || "U";
    const parts = seed.split(" ").filter(Boolean);
    return parts.length > 1
        ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
        : seed.slice(0, 2).toUpperCase();
}

function DetailRow({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ElementType;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-background/70 p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {label}
                </p>
                <p className="mt-0.5 truncate text-sm font-medium text-foreground">{value}</p>
            </div>
        </div>
    );
}

function SecurityNote() {
    return (
        <Card className="border-border/70 bg-card/95 py-0 shadow-sm">
            <CardHeader className="border-b border-border/70 bg-muted/20 px-5 py-5">
                <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <KeyRound className="h-5 w-5" />
                    </div>
                    <div>
                        <CardTitle className="text-lg">Security</CardTitle>
                        <CardDescription>Authentication and credential management.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-5">
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                    <div className="flex items-start gap-3">
                        <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                        <div>
                            <p className="text-sm font-semibold text-foreground">
                                Managed by Keycloak SSO
                            </p>
                            <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                Passwords and account recovery are handled by the university SSO.
                                Contact your administrator if you need credential changes.
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default async function SettingsPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/login");
    }

    const user = session.user;
    const fullName = user.name || "ICPC User";
    const email = user.email || "Not available";
    const isStudent = getDefaultRoute(user) === "/student/dashboard";
    const permissions = [...new Set([...(user.groups ?? []), ...(user.roles ?? [])])];

    return (
        <div className="space-y-6">
            <section className="overflow-hidden rounded-3xl border border-primary/20 bg-[radial-gradient(circle_at_top_left,color-mix(in_srgb,var(--primary)_22%,transparent),transparent_34%),linear-gradient(135deg,color-mix(in_srgb,var(--primary)_10%,var(--card)),var(--card))] shadow-sm">
                <div className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary text-xl font-bold text-primary-foreground shadow-lg shadow-primary/20">
                            {initials(fullName, email)}
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                                    Settings
                                </h1>
                                <Badge
                                    variant="outline"
                                    className="border-primary/20 bg-background/70 text-primary"
                                >
                                    Account preferences
                                </Badge>
                            </div>
                            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                                Manage your profile details, access metadata, and visual preferences
                                for the ICPC platform.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="grid gap-6 xl:grid-cols-[minmax(360px,420px)_1fr]">
                <aside className="space-y-6">
                    <Card className="overflow-hidden border-border/70 bg-card/95 py-0 shadow-sm">
                        <CardHeader className="border-b border-border/70 bg-muted/20 px-5 py-5">
                            <div className="flex items-start gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                    <UserCircle2 className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Profile</CardTitle>
                                    <CardDescription>
                                        Identity from your authenticated SSO session.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-5">
                            <div className="space-y-3">
                                <DetailRow
                                    icon={UserCircle2}
                                    label="Display name"
                                    value={fullName}
                                />
                                <DetailRow icon={Mail} label="Email address" value={email} />
                            </div>
                        </CardContent>
                    </Card>

                    <SecurityNote />
                </aside>

                <main className="space-y-6">
                    <AppearanceSection />

                    {!isStudent && process.env.NODE_ENV !== "production" && (
                        <Card className="border-border/70 bg-card/95 py-0 shadow-sm">
                            <CardHeader className="border-b border-border/70 bg-muted/20 px-5 py-5">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                        <UsersRound className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">Access summary</CardTitle>
                                        <CardDescription>
                                            Groups and permissions attached to your session.
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-5 p-5">
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <DetailRow
                                        icon={ShieldCheck}
                                        label="Default route"
                                        value={getDefaultRoute(user)}
                                    />
                                    <DetailRow
                                        icon={IdCard}
                                        label="Account type"
                                        value={isStudent ? "Student" : "Staff / Admin"}
                                    />
                                </div>

                                <div>
                                    <p className="mb-3 text-sm font-semibold text-foreground">
                                        Groups & permissions
                                    </p>
                                    <div
                                        className={cn(
                                            "flex flex-wrap gap-2 rounded-2xl border border-border/60 bg-background/70 p-4",
                                            permissions.length === 0 &&
                                                "items-center justify-center text-muted-foreground",
                                        )}
                                    >
                                        {permissions.length > 0 ? (
                                            permissions.map((perm) => (
                                                <Badge
                                                    key={perm}
                                                    variant="secondary"
                                                    className="border border-border/70 bg-muted/70 text-foreground"
                                                >
                                                    {perm}
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-sm">No role metadata found.</span>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </main>
            </div>
        </div>
    );
}
