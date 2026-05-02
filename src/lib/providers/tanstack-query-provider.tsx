"use client";

import { QueryClient, QueryClientProvider, MutationCache } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { toast } from "sonner";
import { handleApiError } from "@/lib/handle-api-error";
import { useState, type ReactNode } from "react";

interface TanstackQueryProviderProps {
    children: ReactNode;
}

export default function TanstackQueryProvider({ children }: TanstackQueryProviderProps) {
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
        <QueryClientProvider client={queryClient}>
            {children}
            {process.env.NODE_ENV === "development" ? (
                <ReactQueryDevtools initialIsOpen={false} />
            ) : null}
        </QueryClientProvider>
    );
}
