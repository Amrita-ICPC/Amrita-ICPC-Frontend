"use client";

import { useState, useEffect, type ReactNode } from "react";
import { ChevronLeft, Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SIDENAV_STORAGE_KEY = "icpc.sidenav.collapsed";

export function AppShell({ sidebar, children }: { sidebar: ReactNode; children: ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(() => {
        if (typeof window === "undefined") {
            return false;
        }
        const saved = window.localStorage.getItem(SIDENAV_STORAGE_KEY);
        if (saved !== null) {
            return saved === "1";
        }
        // If no saved preference, collapse on smaller screens by default
        return window.innerWidth < 1024;
    });

    const [isMobileOpen, setIsMobileOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsMobileOpen(false); // Close mobile menu on resize to larger screens
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const toggle = () => {
        setIsCollapsed((prev) => {
            const next = !prev;
            window.localStorage.setItem(SIDENAV_STORAGE_KEY, next ? "1" : "0");
            return next;
        });
    };

    return (
        <div className="flex h-screen overflow-hidden bg-[#0b0d12] text-white relative font-sans">
            {/* Mobile Header Toggle */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <Button
                    variant="outline"
                    size="icon"
                    className="bg-[#0b0d12] border-white/10 text-white shadow-2xl h-10 w-10 rounded-xl hover:bg-white/5 active:scale-95 transition-all"
                    onClick={() => setIsMobileOpen(!isMobileOpen)}
                >
                    {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
            </div>

            {/* Backdrop for Mobile */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 animate-in fade-in"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar Wrapper */}
            <div
                className={cn(
                    // Layout & Base styles
                    "fixed inset-y-0 left-0 z-40 bg-[#0b0d12] border-r border-white/10 transition-[transform,width] duration-300 ease-in-out w-72",

                    // Mobile Logic (Transform based)
                    isMobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full shadow-none",

                    // Desktop Logic (Width based)
                    "lg:relative lg:translate-x-0 lg:shadow-none",
                    isCollapsed ? "lg:w-0" : "lg:w-72",
                )}
            >
                <div
                    className={cn(
                        "h-full w-72 transition-opacity duration-200 ease-in-out",
                        isCollapsed && !isMobileOpen
                            ? "lg:opacity-0 lg:pointer-events-none"
                            : "opacity-100",
                    )}
                >
                    {sidebar}
                </div>

                {/* Desktop Toggle Button */}
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={toggle}
                    className={cn(
                        "hidden lg:flex absolute top-1/2 -right-4 z-50 -translate-y-1/2 h-8 w-8 rounded-full border-white/10 bg-[#0b0d12] text-white shadow-xl hover:bg-white/5 hover:border-white/20 transition-all duration-300",
                        isCollapsed && "rotate-180",
                    )}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
            </div>

            {/* Main Content Area */}
            <div className="min-w-0 flex-1 flex flex-col relative overflow-hidden">{children}</div>
        </div>
    );
}
