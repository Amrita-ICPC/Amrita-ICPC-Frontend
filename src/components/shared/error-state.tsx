"use client";

import { AlertCircle, RefreshCcw, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { handleApiError } from "@/lib/handle-api-error";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ErrorStateProps {
    error: unknown;
    onRetry?: () => void;
    className?: string;
    title?: string;
    description?: string;
}

export function ErrorState({
    error,
    onRetry,
    className,
    title = "Data Fetching Error",
    description,
}: ErrorStateProps) {
    const apiError = handleApiError(error);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-dashed border-border/60 bg-muted/5 backdrop-blur-sm",
                className,
            )}
        >
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-destructive/20 blur-3xl rounded-full" />
                <div className="relative h-20 w-20 rounded-2xl bg-destructive/10 flex items-center justify-center border border-destructive/20 shadow-inner">
                    <ShieldAlert className="h-10 w-10 text-destructive" />
                </div>
            </div>

            <h3 className="text-2xl font-bold tracking-tight text-foreground mb-3">{title}</h3>

            <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed mb-8">
                {description ||
                    apiError.message ||
                    "We encountered a problem while retrieving the requested information. This could be due to a temporary network issue or a server-side error."}
            </p>

            <div className="flex flex-col items-center gap-4">
                {onRetry && (
                    <Button
                        onClick={onRetry}
                        variant="default"
                        size="lg"
                        className="gap-2 px-10 h-12 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        <RefreshCcw className="h-4 w-4" />
                        Try Again
                    </Button>
                )}

                {apiError.requestId && (
                    <div className="flex flex-col items-center gap-1 opacity-40">
                        <span className="text-[9px] uppercase tracking-widest font-bold">
                            Request Tracking ID
                        </span>
                        <code className="text-[10px] font-mono bg-muted px-2 py-0.5 rounded border border-border/40">
                            {apiError.requestId}
                        </code>
                    </div>
                )}
            </div>

            {apiError.errors && apiError.errors.length > 0 && (
                <div className="mt-10 pt-8 border-t border-border/20 w-full max-w-sm">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-4 text-left ml-1">
                        Detailed Context
                    </p>
                    <div className="space-y-2">
                        {apiError.errors.slice(0, 3).map((err, idx) => (
                            <div
                                key={idx}
                                className="flex items-start gap-3 p-3 rounded-xl bg-destructive/5 border border-destructive/10 text-left"
                            >
                                <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                                <div className="space-y-0.5">
                                    {err.field && (
                                        <span className="text-[9px] font-bold uppercase text-destructive/60 block">
                                            {err.field}
                                        </span>
                                    )}
                                    <span className="text-xs text-foreground/80 leading-snug">
                                        {err.message}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
}
