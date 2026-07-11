"use client";

import { Bell, ChevronLeft, ChevronRight, LogOut, Mail, Settings, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import React from "react";

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
import { getDefaultRoute, UserType } from "@/lib/auth/utils";

export function Header() {
    const router = useRouter();
    const pathname = usePathname();
    const { data: session } = useSession();
    const user = session?.user;
    const allRoles = [...(user?.roles ?? []), ...(user?.groups ?? [])];
    const isAdmin = allRoles.some((r) => r.toLowerCase() === UserType.ADMIN.toLowerCase());
    const isStudent = user ? getDefaultRoute(user) === "/student/dashboard" : false;

    const segments = pathname.split("/").filter(Boolean);

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

            <div className="h-4 w-px bg-border mx-2" />

            <Breadcrumb>
                <BreadcrumbList>
                    {segments.length > 0 && (
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href={isStudent ? "/student/dashboard" : "/dashboard"}>
                                    Dashboard
                                </Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                    )}
                    {segments.map((segment, index) => {
                        if (segment === "dashboard" || segment === "student") return null;

                        const isLast = index === segments.length - 1;
                        const href = "/" + segments.slice(0, index + 1).join("/");
                        const label =
                            segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");

                        return (
                            <React.Fragment key={href}>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    {isLast ? (
                                        <BreadcrumbPage>{label}</BreadcrumbPage>
                                    ) : (
                                        <BreadcrumbLink asChild>
                                            <Link href={href}>{label}</Link>
                                        </BreadcrumbLink>
                                    )}
                                </BreadcrumbItem>
                            </React.Fragment>
                        );
                    })}
                </BreadcrumbList>
            </Breadcrumb>

            <div className="flex-1" />

            <div className="flex items-center gap-2 mr-2">
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

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative h-9 w-9 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
                            aria-label="User Menu"
                            title="User Menu"
                        >
                            <User className="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 mt-1">
                        <DropdownMenuLabel className="font-normal">
                            <p className="text-sm font-medium">{user?.name || "ICPC User"}</p>
                            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/settings" className="cursor-pointer">
                                <Settings className="h-4 w-4 mr-2" />
                                <span>Settings</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => signOut({ callbackUrl: "/auth/login" })}
                            className="cursor-pointer text-destructive focus:text-destructive"
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            <span>Sign out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
