"use client";

import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { type ReactNode } from "react";

import { SessionIntegrityProvider } from "./session-integrity-provider";
import { ClockSyncProvider } from "./clock-sync-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { EditorProvider } from "@/components/shared/TipTap";
import TanstackQueryProvider from "./tanstack-query-provider";
import { Toaster } from "sonner";

interface ProviderProps {
    children: ReactNode;
}

export default function Provider({ children }: ProviderProps) {
    return (
        <SessionProvider>
            <SessionIntegrityProvider>
                <ClockSyncProvider>
                    <TanstackQueryProvider>
                        <EditorProvider>
                            <ThemeProvider
                                attribute="class"
                                defaultTheme="system"
                                enableSystem
                                disableTransitionOnChange
                            >
                                <TooltipProvider>
                                    {children}
                                    <Toaster
                                        position="top-right"
                                        richColors
                                        closeButton
                                        duration={3000}
                                    />
                                </TooltipProvider>
                            </ThemeProvider>
                        </EditorProvider>
                    </TanstackQueryProvider>
                </ClockSyncProvider>
            </SessionIntegrityProvider>
        </SessionProvider>
    );
}
