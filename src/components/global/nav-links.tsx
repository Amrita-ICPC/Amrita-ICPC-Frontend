"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Trophy,
    Users,
    Database,
    FileCode2,
    UsersRound,
    Settings,
} from "lucide-react";

const NAV_ITEMS = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/contest", label: "Contests", icon: Trophy },
    { href: "/teams", label: "Teams", icon: Users },
    { href: "/banks", label: "Question Banks", icon: Database },
    { href: "/questions", label: "Question Editor", icon: FileCode2 },
    { href: "/settings", label: "Settings", icon: Settings },
];

const ADMIN_ITEMS = [
    { href: "/audiences", label: "Manage Users", icon: UsersRound },
];

interface NavLinksProps {
    isAdmin: boolean;
}

function NavItem({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) {
    const pathname = usePathname();
    const active = pathname === href || pathname.startsWith(href + "/");
    return (
        <li>
            <Link
                href={href}
                className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    active
                        ? "bg-sidebar-accent text-sidebar-foreground font-medium"
                        : "text-sidebar-foreground/55 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                )}
            >
                <Icon className={cn("h-4 w-4 shrink-0", active ? "opacity-100" : "opacity-70")} />
                {label}
            </Link>
        </li>
    );
}

export function NavLinks({ isAdmin }: NavLinksProps) {
    return (
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
            <div>
                <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/30">
                    Menu
                </p>
                <ul className="space-y-0.5">
                    {NAV_ITEMS.map((item) => (
                        <NavItem key={item.href} {...item} />
                    ))}
                </ul>
            </div>

            {isAdmin && (
                <div>
                    <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/30">
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
