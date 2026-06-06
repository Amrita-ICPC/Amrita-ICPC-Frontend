"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { type ReactNode } from "react";
import { Toaster } from "sonner";

import { TooltipProvider } from "@/components/ui/tooltip";

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
