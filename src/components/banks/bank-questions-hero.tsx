"use client";

import { AlertCircle, BarChart3, FileCode2, Library, Plus, Zap } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

interface BankQuestionsHeroProps {
    bankId: string;
    bankName?: string;
    stats: {
        total: number;
        easy: number;
        medium: number;
        hard: number;
    };
}

export function BankQuestionsHero({ bankId, bankName, stats }: BankQuestionsHeroProps) {
    return (
        <div className="relative overflow-hidden rounded-[12px] border border-border/60 bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-sm">
            <div className="relative space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-[22px] font-bold tracking-tight text-foreground">
                            Questions
                        </h2>
                        <p className="text-[13px] text-muted-foreground mt-1 max-w-2xl">
                            Curate the problem set inside{" "}
                            <span className="text-foreground font-medium">
                                {bankName || "this bank"}
                            </span>
                            . Track difficulty distribution and reuse these questions across
                            contests.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                        <Button className="shadow-lg shadow-primary/20 gap-2 h-9 px-4" asChild>
                            <Link href={`/banks/${bankId}/questions/new`}>
                                <Plus className="h-4 w-4" />
                                Add Question
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            className="bg-background/50 backdrop-blur-sm gap-2 h-9 px-4 border-border/60 hover:bg-muted/50 transition-colors"
                        >
                            <Link href={`/banks/${bankId}/import`}>
                                <Library className="h-4 w-4" />
                                Import
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Counts */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-3 shadow-sm">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <FileCode2 className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-bold leading-none text-foreground">
                                {stats.total}
                            </span>
                            <span className="text-[12px] text-muted-foreground mt-1">
                                Total Questions
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-3 shadow-sm">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                            <Zap className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-bold leading-none text-foreground">
                                {stats.easy}
                            </span>
                            <span className="text-[12px] text-muted-foreground mt-1">Easy</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-3 shadow-sm">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                            <BarChart3 className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-bold leading-none text-foreground">
                                {stats.medium}
                            </span>
                            <span className="text-[12px] text-muted-foreground mt-1">Medium</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-3 shadow-sm">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                            <AlertCircle className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-bold leading-none text-foreground">
                                {stats.hard}
                            </span>
                            <span className="text-[12px] text-muted-foreground mt-1">Hard</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
