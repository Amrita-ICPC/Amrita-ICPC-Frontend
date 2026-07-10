"use client";

import { Bell, ChevronLeft, ChevronRight, LogOut, Mail, Settings, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getDefaultRoute, UserType } from "@/lib/auth/utils";
import { cn } from "@/lib/utils";

import { ADMIN_ITEMS, NAV_ITEMS } from "./nav-links";

function TopNavItem({
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
        <Link
            href={href}
            className={cn(
                "group flex h-9 items-center rounded-full px-2.5 transition-all duration-300 ease-in-out hover:bg-accent hover:text-accent-foreground",
                active ? "bg-accent text-accent-foreground shadow-sm" : "text-muted-foreground",
            )}
        >
            <Icon className={cn("h-4 w-4 shrink-0")} />
            <span
                className={cn(
                    "overflow-hidden whitespace-nowrap text-sm font-medium transition-all duration-300 ease-in-out",
                    active
                        ? "ml-2 max-w-[120px] opacity-100"
                        : "max-w-0 opacity-0 group-hover:ml-2 group-hover:max-w-[120px] group-hover:opacity-100",
                )}
            >
                {label}
            </span>
        </Link>
    );
}

export function Header() {
    const router = useRouter();
    const { data: session } = useSession();
    const user = session?.user;
    const allRoles = [...(user?.roles ?? []), ...(user?.groups ?? [])];
    const isAdmin = allRoles.some((r) => r.toLowerCase() === UserType.ADMIN.toLowerCase());
    const isStudent = user ? getDefaultRoute(user) === "/student/dashboard" : false;

    return (
        <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-border bg-card/95 px-6 backdrop-blur-sm">
            <div className="flex h-14 items-center border-r border-border pr-2 mr-1">
                <div className="flex h-full w-16 items-center justify-start overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/logo.png"
                        alt="ICPC Logo"
                        className="-ml-3 h-20 w-auto max-w-none object-cover"
                    />
                </div>
            </div>

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

            <nav className="flex items-center gap-1 ml-2">
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
                        <TopNavItem
                            key={item.label}
                            href={href}
                            label={item.label}
                            icon={item.icon}
                        />
                    );
                })}
                {isAdmin && (
                    <>
                        <div className="mx-2 h-4 w-px bg-border" />
                        {ADMIN_ITEMS.map((item) => (
                            <TopNavItem
                                key={item.href}
                                href={item.href}
                                label={item.label}
                                icon={item.icon}
                            />
                        ))}
                    </>
                )}
            </nav>

            <div className="flex-1" />

            <div className="flex items-center gap-2 mr-2">
                <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="h-9 w-9 text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                    <Link href="/settings" title="Settings">
                        <Settings className="h-5 w-5" />
                    </Link>
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-muted-foreground hover:bg-accent hover:text-foreground"
                            aria-label="User Menu"
                            title="User Menu"
                        >
                            <User className="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-60 mb-1">
                        <DropdownMenuItem
                            onClick={() => signOut({ callbackUrl: "/auth/login" })}
                            className="cursor-pointer group flex items-center justify-between p-3 focus:bg-destructive/10"
                        >
                            <div className="flex flex-col min-w-0 pr-4">
                                <p className="text-sm font-medium truncate">
                                    {user?.name || "ICPC User"}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                    {user?.email}
                                </p>
                            </div>
                            <LogOut className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-destructive" />
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

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
                                <p className="text-xs text-muted-foreground">
                                    No new notifications
                                </p>
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </header>
    );
}
