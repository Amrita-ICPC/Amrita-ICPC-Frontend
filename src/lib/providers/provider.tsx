"use client";

import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider, MutationCache } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster, toast } from "sonner";
import { handleApiError } from "@/lib/handle-api-error";
import { useState, type ReactNode } from "react";

interface ProviderProps {
    children: ReactNode;
}

import { SessionIntegrityProvider } from "./session-integrity-provider";
import { ClockSyncProvider } from "./clock-sync-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { EditorProvider } from "@/components/shared/TipTap";

export default function Provider({ children }: ProviderProps) {
    const [queryClient] = useState(() => {
        const client = new QueryClient({
            mutationCache: new MutationCache({
                onSuccess: async (_data, _variables, _context, mutation) => {
                    const meta = mutation.options.meta as any;

                    if (meta?.successMessage) {
                        toast.success(meta.successMessage);
                    }

                    if (meta?.invalidateKeys) {
                        const keys = Array.isArray(meta.invalidateKeys)
                            ? meta.invalidateKeys
                            : [meta.invalidateKeys];

                        await Promise.all(
                            keys.map((key: any) => client.invalidateQueries({ queryKey: key })),
                        );
                    }
                },

                onError: (error) => {
                    const apiError = handleApiError(error);
                    toast.error(apiError.message);
                },
            }),

            defaultOptions: {
                queries: {
                    staleTime: 60 * 1000,
                    refetchOnWindowFocus: false,
                },
            },
        });

        return client;
    });

    return (
        <SessionProvider>
            <SessionIntegrityProvider>
                <ClockSyncProvider>
                    <QueryClientProvider client={queryClient}>
                        <ThemeProvider
                            attribute="class"
                            defaultTheme="system"
                            enableSystem
                            disableTransitionOnChange
                        >
                            <TooltipProvider>
                                <EditorProvider>{children}</EditorProvider>
                                <Toaster
                                    position="top-right"
                                    richColors
                                    closeButton
                                    duration={3000}
                                />
                                {process.env.NODE_ENV === "development" ? (
                                    <ReactQueryDevtools initialIsOpen={false} />
                                ) : null}
                            </TooltipProvider>
                        </ThemeProvider>
                    </QueryClientProvider>
                </ClockSyncProvider>
            </SessionIntegrityProvider>
        </SessionProvider>
    );
}
