"use client";

import {
    Database,
    FileCode2,
    LayoutDashboard,
    Settings,
    Trophy,
    UserRoundCog,
    Users,
    UsersRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const WORKSPACE_ITEMS = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/contest", label: "Contests", icon: Trophy },
    { href: "/banks", label: "Question Banks", icon: Database },
    { href: "/questions", label: "Question Editor", icon: FileCode2 },
    { href: "/teams", label: "Teams", icon: Users },
];

const MANAGEMENT_ITEMS = [
    { href: "/groups", label: "Groups", icon: UsersRound },
    { href: "/users", label: "Users", icon: UserRoundCog },
];

const CONFIGURATION_ITEMS = [{ href: "/settings", label: "Settings", icon: Settings }];

interface NavLinksProps {
    isAdmin: boolean;
    isStudent?: boolean;
}

function NavItem({
    href,
    label,
    icon: Icon,
}: {
    href: string;
    label: string;
    icon: React.ElementType;
}) {
    const pathname = usePathname();
    const active = pathname === href || pathname.startsWith(href + "/");
    return (
        <li>
            <Link
                href={href}
                className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    active
                        ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground border border-sidebar-border/40"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
            >
                <Icon className={cn("h-4 w-4 shrink-0", active ? "opacity-100" : "opacity-70")} />
                {label}
            </Link>
        </li>
    );
}

export function NavLinks({ isAdmin, isStudent }: NavLinksProps) {
    return (
        <nav className="flex-1 space-y-5 overflow-y-auto px-2.5 py-3">
            <div>
                <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Workspace
                </p>
                <ul className="space-y-0.5">
                    {WORKSPACE_ITEMS.map((item) => {
                        let href = item.href;
                        if (isStudent) {
                            if (item.label === "Dashboard") href = "/student/dashboard";
                            if (item.label === "Contests") href = "/student/contest";
                            if (item.label === "Teams") href = "/student/teams";
                        }
                        return (
                            <NavItem
                                key={item.label}
                                href={href}
                                label={item.label}
                                icon={item.icon}
                            />
                        );
                    })}
                </ul>
            </div>

            {isAdmin && (
                <div>
                    <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                        Management
                    </p>
                    <ul className="space-y-0.5">
                        {MANAGEMENT_ITEMS.map((item) => (
                            <NavItem key={item.href} {...item} />
                        ))}
                    </ul>
                </div>
            )}

            <div>
                <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Configuration
                </p>
                <ul className="space-y-0.5">
                    {CONFIGURATION_ITEMS.map((item) => (
                        <NavItem key={item.href} {...item} />
                    ))}
                </ul>
            </div>
        </nav>
    );
}
