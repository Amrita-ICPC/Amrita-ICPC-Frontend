"use client";

import { Fragment } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Bell, Mail } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { getDefaultRoute } from "@/lib/auth/utils";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SEGMENT_LABELS: Record<string, string> = {
    dashboard: "Dashboard",
    contest: "Contests",
    create: "Create",
    teams: "Teams",
    banks: "Question Banks",
    questions: "Questions",
    settings: "Settings",
    users: "Users",
    group: "Group",
    groups: "Groups",
    audiences: "Groups",
};

function isUUID(s: string) {
    return (
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s) ||
        /^[0-9a-f]{24}$/i.test(s)
    );
}

function segmentLabel(seg: string, prev?: string): string {
    if (isUUID(seg)) {
        return "Details";
    }
    return SEGMENT_LABELS[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1);
}

export function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session } = useSession();
    const isStudent = session?.user
        ? getDefaultRoute(session.user) === "/student/dashboard"
        : false;

    const segments = pathname.split("/").filter(Boolean);

    const segmentsWithIndex = segments.map((seg, index) => ({ seg, originalIndex: index }));

    // Filter out redundant UUIDs in nested paths (e.g. /contest/[id]/questions/[id]/edit)
    const filteredSegments = segmentsWithIndex.filter(({ seg, originalIndex }) => {
        const prev = segments[originalIndex - 1];
        const next = segments[originalIndex + 1];

        // If this is a question UUID and there's a next segment (like edit), skip it
        if (isUUID(seg) && prev === "questions" && next) {
            return false;
        }
        return true;
    });

    let crumbs;
    if (pathname === "/invitation") {
        const dashboardHref = isStudent ? "/student/dashboard" : "/dashboard";
        crumbs = [
            { href: dashboardHref, label: "Dashboard", isLast: false },
            { href: "/invitation", label: "Invitation", isLast: true },
        ];
    } else {
        crumbs = filteredSegments.map(({ seg, originalIndex }, i) => {
            const href = "/" + segments.slice(0, originalIndex + 1).join("/");
            const label = segmentLabel(seg, segments[originalIndex - 1]);
            const isLast = i === filteredSegments.length - 1;
            return { href, label, isLast };
        });
    }

    return (
        <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-border bg-card/95 px-6 backdrop-blur-sm">
            <div className="flex items-center gap-1">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:bg-accent hover:text-foreground"
                    onClick={() => router.back()}
                    title="Go back"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:bg-accent hover:text-foreground"
                    onClick={() => router.forward()}
                    title="Go forward"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            <div className="h-4 w-px bg-border" />

            <Breadcrumb>
                <BreadcrumbList>
                    {crumbs.map((crumb, i) => (
                        <Fragment key={crumb.href}>
                            {i > 0 && <BreadcrumbSeparator />}
                            <BreadcrumbItem>
                                {crumb.isLast ? (
                                    <BreadcrumbPage className="font-medium text-foreground">
                                        {crumb.label}
                                    </BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink asChild>
                                        <Link
                                            href={crumb.href}
                                            className="text-muted-foreground transition-colors hover:text-foreground"
                                        >
                                            {crumb.label}
                                        </Link>
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                        </Fragment>
                    ))}
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex-1" />

            {isStudent ? (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative h-9 w-9 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
                            aria-label="Notifications"
                            title="Notifications"
                        >
                            <Bell className="h-5 w-5" />
                            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-orange-500 ring-2 ring-background animate-pulse" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                        <DropdownMenuLabel className="font-semibold text-sm px-4 py-3">
                            Notifications
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link
                                href="/invitation"
                                className="flex items-start gap-3 p-3 cursor-pointer hover:bg-muted/50 focus:bg-muted/50 rounded-md transition-colors"
                            >
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <Mail className="h-4 w-4" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <p className="text-xs font-semibold text-foreground">
                                        Team Invitation
                                    </p>
                                    <p className="text-[11px] text-muted-foreground leading-normal">
                                        You have been invited to join a contest team. Click to
                                        respond.
                                    </p>
                                </div>
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative h-9 w-9 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
                            aria-label="Notifications"
                            title="Notifications"
                        >
                            <Bell className="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                        <DropdownMenuLabel className="font-semibold text-sm px-4 py-3">
                            Notifications
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <div className="flex flex-col items-center justify-center p-6 text-center">
                            <p className="text-xs text-muted-foreground">No new notifications</p>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </header>
    );
}
