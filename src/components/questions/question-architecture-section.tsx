"use client";

import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TiptapToolbar, EditorContent } from "../shared/TipTap";

interface QuestionArchitectureSectionProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    editor: any;
}

export function QuestionArchitectureSection({
    activeTab,
    onTabChange,
    editor,
}: QuestionArchitectureSectionProps) {
    return (
        <motion.div className="space-y-6 pt-4">
            <div className="flex items-center justify-between px-2 pb-1 border-b border-border/40">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <FileText className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Problem Architecture</h2>
                        <p className="text-xs text-muted-foreground">
                            Design the structure and details of the challenge
                        </p>
                    </div>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
                <TabsList className="w-full justify-start overflow-x-auto bg-muted/30 border border-border/40 p-1 mb-8 shadow-inner rounded-xl">
                    <TabsTrigger
                        value="description"
                        className="flex-1 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all py-2.5"
                    >
                        Description
                    </TabsTrigger>
                    <TabsTrigger
                        value="input"
                        className="flex-1 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all py-2.5"
                    >
                        Input Format
                    </TabsTrigger>
                    <TabsTrigger
                        value="output"
                        className="flex-1 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all py-2.5"
                    >
                        Output Format
                    </TabsTrigger>
                    <TabsTrigger
                        value="constraints"
                        className="flex-1 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all py-2.5"
                    >
                        Constraints
                    </TabsTrigger>
                    <TabsTrigger
                        value="notes"
                        className="flex-1 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all py-2.5"
                    >
                        Notes
                    </TabsTrigger>
                </TabsList>

                <div className="mt-6">
                    <div className="flex flex-col border border-border/60 rounded-xl overflow-hidden bg-card/20 shadow-sm transition-all duration-200 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50">
                        <TiptapToolbar />
                        <div className="h-[400px] overflow-y-auto bg-background/50 custom-scrollbar">
                            <EditorContent editor={editor} className="h-full" />
                        </div>
                    </div>
                </div>
            </Tabs>
        </motion.div>
    );
}
