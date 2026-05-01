"use client";

import { Fragment } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";

const SEGMENT_LABELS: Record<string, string> = {
    dashboard: "Dashboard",
    contest: "Contests",
    create: "Create",
    teams: "Teams",
    banks: "Question Banks",
    questions: "Questions",
    settings: "Settings",
    audiences: "Manage Users",
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

    const segments = pathname.split("/").filter(Boolean);

    // Filter out redundant UUIDs in nested paths (e.g. /contest/[id]/questions/[id]/edit)
    const filteredSegments = segments.filter((seg, i) => {
        const prev = segments[i - 1];
        const next = segments[i + 1];

        // If this is a question UUID and there's a next segment (like edit), skip it
        if (isUUID(seg) && prev === "questions" && next) {
            return false;
        }
        return true;
    });

    const crumbs = filteredSegments.map((seg, i) => {
        const originalIndex = segments.indexOf(seg);
        const href = "/" + segments.slice(0, originalIndex + 1).join("/");
        const label = segmentLabel(seg, segments[originalIndex - 1]);
        const isLast = i === filteredSegments.length - 1;
        return { href, label, isLast };
    });

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
        </header>
    );
}
