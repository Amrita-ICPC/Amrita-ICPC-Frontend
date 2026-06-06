"use client";

import { MutationCache, QueryClient, QueryClientProvider, QueryKey } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { type ReactNode, useState } from "react";
import { toast } from "sonner";

import { handleApiError } from "@/lib/handle-api-error";

interface TanstackQueryProviderProps {
    children: ReactNode;
}

type MutationMeta = {
    successMessage?: string;
    invalidateKeys?: QueryKey[];
};

export default function TanstackQueryProvider({ children }: TanstackQueryProviderProps) {
    const [queryClient] = useState(() => {
        const client = new QueryClient({
            mutationCache: new MutationCache({
                onSuccess: async (_data, _variables, _context, mutation) => {
                    const meta = mutation.options.meta as MutationMeta | undefined;

                    if (meta?.successMessage) {
                        toast.success(meta.successMessage);
                    }

                    if (meta?.invalidateKeys?.length) {
                        await Promise.all(
                            meta.invalidateKeys.map((key) =>
                                client.invalidateQueries({ queryKey: key }),
                            ),
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
