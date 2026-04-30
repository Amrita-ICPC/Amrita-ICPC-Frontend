"use client";

import { motion } from "framer-motion";
import { Check, Code2, Beaker, Zap, ShieldCheck, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
    { id: "starter", label: "Starter Code", icon: Code2 },
    { id: "solution", label: "Solution Code", icon: Zap },
    { id: "testcases", label: "Test Cases", icon: Beaker },
    { id: "driver", label: "Driver Code", icon: Terminal },
];

interface QuestionWorkflowProps {
    currentStep: string;
    onStepClick?: (stepId: string) => void;
}

export function QuestionWorkflow({ currentStep, onStepClick }: QuestionWorkflowProps) {
    const activeIndex = STEPS.findIndex((s) => s.id === currentStep);

    return (
        <div className="w-full py-12 px-4 select-none">
            <div className="relative flex justify-between max-w-4xl mx-auto">
                {/* Background Line */}
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border/40 -translate-y-1/2" />

                {/* Progress Line */}
                <motion.div
                    className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-primary/80 to-primary -translate-y-1/2 origin-left"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: activeIndex / (STEPS.length - 1) }}
                    transition={{ type: "spring", stiffness: 50, damping: 20 }}
                    style={{ width: "100%" }}
                />

                {STEPS.map((step, index) => {
                    const isCompleted = index < activeIndex;
                    const isActive = index === activeIndex;
                    const Icon = step.icon;

                    return (
                        <div key={step.id} className="relative flex flex-col items-center group">
                            {/* Step Node */}
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onStepClick?.(step.id)}
                                className={cn(
                                    "relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-500 shadow-xl",
                                    isCompleted
                                        ? "bg-primary text-primary-foreground shadow-primary/20"
                                        : isActive
                                          ? "bg-background border-2 border-primary text-primary shadow-primary/10 ring-4 ring-primary/5"
                                          : "bg-muted/50 border border-border/60 text-muted-foreground hover:border-primary/50",
                                )}
                            >
                                {isCompleted ? (
                                    <Check className="h-6 w-6 stroke-[3px]" />
                                ) : (
                                    <Icon
                                        className={cn(
                                            "h-5 w-5 transition-transform duration-300",
                                            isActive && "scale-110",
                                        )}
                                    />
                                )}

                                {/* Pulse effect for active step */}
                                {isActive && (
                                    <span className="absolute inset-0 rounded-2xl bg-primary/20 animate-ping" />
                                )}
                            </motion.button>

                            {/* Label */}
                            <div className="absolute -bottom-10 flex flex-col items-center min-w-[120px]">
                                <span
                                    className={cn(
                                        "text-[11px] font-bold uppercase tracking-widest transition-all duration-300",
                                        isActive
                                            ? "text-primary opacity-100 translate-y-0"
                                            : "text-muted-foreground/60 opacity-80",
                                    )}
                                >
                                    {step.label}
                                </span>

                                {isActive && (
                                    <motion.div
                                        layoutId="active-indicator"
                                        className="h-1 w-1 rounded-full bg-primary mt-1"
                                    />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
