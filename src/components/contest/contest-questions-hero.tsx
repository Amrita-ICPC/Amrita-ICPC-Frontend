"use client";

import Link from "next/link";
import { Plus, Library } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface ContestQuestionsHeroProps {
    contestId: string;
    contestName?: string;
}

export function ContestQuestionsHero({ contestId, contestName }: ContestQuestionsHeroProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-primary/5 p-8 shadow-xl shadow-primary/5"
        >
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl" />

            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Contest Questions
                    </h1>
                    <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
                        Explore the challenges designed for{" "}
                        <span className="text-foreground font-medium">
                            {contestName || "this contest"}
                        </span>
                        . Monitor difficulty distribution and manage the problem set for
                        participants.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <Button className="shadow-lg shadow-primary/20 gap-2 h-10 px-5" asChild>
                        <Link href={`/contest/${contestId}/questions/new`}>
                            <Plus className="h-4 w-4" />
                            Add Question
                        </Link>
                    </Button>
                    <Button
                        variant="outline"
                        className="bg-background/50 backdrop-blur-sm gap-2 h-10 px-5 border-border/60 hover:bg-muted/50 transition-colors"
                        asChild
                    >
                        <Link href={`/contest/${contestId}/questions/import`}>
                            <Library className="h-4 w-4" />
                            Import from Bank
                        </Link>
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}
