"use client";

import {
    CalendarCheck2,
    Code2,
    Database,
    FileCode2,
    LayoutDashboard,
    Trophy,
    UserRoundCog,
    Users,
    UsersRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export const NAV_ITEMS = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/contest", label: "Contests", icon: Trophy },
    {
        href: "/student/my-contests",
        label: "My Contests",
        icon: CalendarCheck2,
        hideForStaff: true,
    },
    { href: "/teams", label: "Teams", icon: Users, hideForStaff: true },
    { href: "/banks", label: "Question Banks", icon: Database, hideForStudent: true },
    {
        href: "/questions",
        label: "Question Editor",
        icon: FileCode2,
        hideForStaff: true,
        hideForStudent: true,
    },
];

export const ADMIN_ITEMS = [
    { href: "/users", label: "Users", icon: UserRoundCog },
    { href: "/groups", label: "Groups", icon: UsersRound },
    { href: "/languages", label: "Languages", icon: Code2 },
];

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
                title={label}
                className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors overflow-hidden",
                    active
                        ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground shadow-[inset_0_0_0_1px_var(--sidebar-border)]"
                        : "text-sidebar-foreground/72 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
                )}
            >
                <Icon className={cn("h-5 w-5 shrink-0", active ? "opacity-100" : "opacity-70")} />
                <span className="whitespace-nowrap opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    {label}
                </span>
            </Link>
        </li>
    );
}

export function NavLinks({ isAdmin, isStudent }: NavLinksProps) {
    return (
        <nav className="w-full space-y-5 overflow-y-auto px-2.5 py-3">
            <div>
                <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-ring/80 opacity-0 transition-opacity duration-300 group-hover:opacity-100 whitespace-nowrap h-4">
                    Menu
                </p>
                <ul className="space-y-0.5">
                    {NAV_ITEMS.filter((item) =>
                        isStudent ? !item.hideForStudent : !item.hideForStaff,
                    ).map((item) => {
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
                    <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-ring/80 opacity-0 transition-opacity duration-300 group-hover:opacity-100 whitespace-nowrap h-4">
                        Admin
                    </p>
                    <ul className="space-y-0.5">
                        {ADMIN_ITEMS.map((item) => (
                            <NavItem key={item.href} {...item} />
                        ))}
                    </ul>
                </div>
            )}
        </nav>
    );
}
