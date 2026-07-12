"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { NavLinks } from "./nav-links";
import { UserMenu } from "./user-menu";

interface SidenavbarClientProps {
    isAdmin: boolean;
    isStudent: boolean;
    user?: {
        name?: string | null;
        email?: string | null;
    };
}

export function SidenavbarClient({ isAdmin, isStudent, user }: SidenavbarClientProps) {
    const [collapsed, setCollapsed] = useState(false);

    const toggleCollapsed = () => {
        setCollapsed((current) => !current);
    };

    return (
        <TooltipProvider delayDuration={150}>
            <aside
                className={cn(
                    "flex h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 ease-out",
                    collapsed ? "w-[4.5rem]" : "w-60",
                )}
            >
                <div
                    className={cn(
                        "flex items-center border-b border-sidebar-border py-5",
                        collapsed ? "flex-col justify-center gap-2 px-3" : "gap-3 px-5",
                    )}
                >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-xs font-bold text-sidebar-primary-foreground shadow-[0_0_0_1px_var(--sidebar-ring)]">
                        IC
                    </div>
                    {!collapsed && (
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold leading-tight text-sidebar-foreground">
                                ICPC Platform
                            </p>
                            <p className="text-[10px] leading-tight text-sidebar-foreground/60">
                                Amrita University
                            </p>
                        </div>
                    )}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                                onClick={toggleCollapsed}
                                className={cn(
                                    "h-8 w-8 shrink-0 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                )}
                            >
                                {collapsed ? (
                                    <PanelLeftOpen className="h-4 w-4" />
                                ) : (
                                    <PanelLeftClose className="h-4 w-4" />
                                )}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                            {collapsed ? "Expand sidebar" : "Collapse sidebar"}
                        </TooltipContent>
                    </Tooltip>
                </div>

                <NavLinks isAdmin={isAdmin} isStudent={isStudent} collapsed={collapsed} />

                <div
                    className={cn(
                        "border-t border-sidebar-border pb-4 pt-2",
                        collapsed ? "px-2" : "px-3",
                    )}
                >
                    <UserMenu name={user?.name} email={user?.email} collapsed={collapsed} />
                </div>
            </aside>
        </TooltipProvider>
    );
}
