"use client";

import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { LogOut, Moon, Settings, Sun } from "lucide-react";
import Link from "next/link";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function initials(name?: string | null, email?: string | null) {
    const s = name || email || "U";
    const parts = s.split(" ").filter(Boolean);
    return parts.length > 1
        ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
        : s.slice(0, 2).toUpperCase();
}

interface UserMenuProps {
    name?: string | null;
    email?: string | null;
}

export function UserMenu({ name, email }: UserMenuProps) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    const isDark = mounted ? theme === "dark" : false;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-sidebar-accent">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-accent text-[11px] font-semibold text-sidebar-foreground">
                        {initials(name, email)}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-sidebar-foreground">
                            {name || "ICPC User"}
                        </p>
                        <p className="truncate text-[10px] text-sidebar-foreground/40">
                            {email}
                        </p>
                    </div>
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent side="top" align="start" className="w-56 mb-1">
                <DropdownMenuLabel className="font-normal">
                    <p className="text-sm font-medium">{name || "ICPC User"}</p>
                    <p className="text-xs text-muted-foreground truncate">{email}</p>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    onClick={() => setTheme(isDark ? "light" : "dark")}
                    className="cursor-pointer"
                >
                    {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    <span>{isDark ? "Light mode" : "Dark mode"}</span>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                    <Link href="/settings">
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/auth/login" })}
                    className="cursor-pointer text-destructive focus:text-destructive"
                >
                    <LogOut className="h-4 w-4" />
                    <span>Sign out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
