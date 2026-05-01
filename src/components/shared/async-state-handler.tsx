"use client";

import { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { ErrorState } from "./error-state";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface AsyncStateHandlerProps {
    isLoading: boolean;
    isError: boolean;
    error: unknown;
    onRetry?: () => void;
    children: ReactNode;
    loadingComponent?: ReactNode;
    errorTitle?: string;
    className?: string;
    // If true, the handler will not take up the full container/page
    inline?: boolean;
}

export function AsyncStateHandler({
    isLoading,
    isError,
    error,
    onRetry,
    children,
    loadingComponent,
    errorTitle,
    className,
    inline = false,
}: AsyncStateHandlerProps) {
    return (
        <AnimatePresence mode="wait">
            {isLoading ? (
                <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={cn(
                        !loadingComponent && "flex flex-col items-center justify-center gap-4",
                        !inline && !loadingComponent && "min-h-[400px]",
                        "w-full",
                        className,
                    )}
                >
                    {loadingComponent || (
                        <div className="flex flex-col items-center gap-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
                                <div className="relative h-16 w-16 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-center shadow-inner">
                                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                                </div>
                            </div>
                            <div className="space-y-2 text-center">
                                <p className="text-sm font-bold tracking-widest text-primary uppercase animate-pulse">
                                    Syncing
                                </p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-tighter opacity-60">
                                    Please wait while we fetch your data
                                </p>
                            </div>
                        </div>
                    )}
                </motion.div>
            ) : isError ? (
                <motion.div
                    key="error"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    className={cn(!inline && "w-full py-12", className)}
                >
                    <ErrorState error={error} onRetry={onRetry} title={errorTitle} />
                </motion.div>
            ) : (
                <motion.div
                    key="content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full"
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
