"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { type ReactNode } from "react";
import { Toaster } from "sonner";

import { TooltipProvider } from "@/components/ui/tooltip";
import { THEME_IDS } from "@/lib/theme-config";

import { SessionIntegrityProvider } from "./session-integrity-provider";
import TanstackQueryProvider from "./tanstack-query-provider";

interface ProviderProps {
    children: ReactNode;
}

export default function Provider({ children }: ProviderProps) {
    return (
        <SessionProvider>
            <SessionIntegrityProvider>
                <TanstackQueryProvider>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                        themes={THEME_IDS}
                        disableTransitionOnChange
                    >
                        <TooltipProvider>{children}</TooltipProvider>
                        <Toaster richColors closeButton />
                    </ThemeProvider>
                </TanstackQueryProvider>
            </SessionIntegrityProvider>
        </SessionProvider>
    );
}
