"use client";

import { motion } from "framer-motion";
import { FileText } from "lucide-react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { EditorContent, TiptapToolbar } from "../shared/TipTap";

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
        <motion.div className="flex flex-col w-full">
            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-border/40 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <FileText className="h-4 w-4" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold tracking-tight">Problem Statement</h2>
                        <p className="text-[10px] text-muted-foreground">
                            Design the description and constraints of the challenge
                        </p>
                    </div>
                </div>
            </div>

            <Tabs
                value={activeTab}
                onValueChange={onTabChange}
                className="flex-1 flex flex-col min-h-0 p-6"
            >
                {/* Underline Tabs Header Layout with negative margin aligning trigger border to bottom line */}
                <div className="flex items-end justify-between border-b border-border/40 w-full mb-5 shrink-0 pt-2">
                    <TabsList className="bg-transparent p-0 h-auto gap-6 border-none rounded-none shadow-none justify-start overflow-x-auto custom-scrollbar -mb-[1px]">
                        <TabsTrigger
                            value="description"
                            className="bg-transparent rounded-none shadow-none border-t-0 border-x-0 border-b-2 border-transparent data-[state=active]:border-[#2563eb] dark:data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-muted-foreground hover:text-foreground data-[state=active]:text-[#2563eb] dark:data-[state=active]:text-primary transition-all pb-2.5 px-1 font-bold text-xs cursor-pointer focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
                        >
                            Problem Statement *
                        </TabsTrigger>
                        <TabsTrigger
                            value="input"
                            className="bg-transparent rounded-none shadow-none border-t-0 border-x-0 border-b-2 border-transparent data-[state=active]:border-[#2563eb] dark:data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-muted-foreground hover:text-foreground data-[state=active]:text-[#2563eb] dark:data-[state=active]:text-primary transition-all pb-2.5 px-1 font-bold text-xs cursor-pointer focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
                        >
                            Input Format
                        </TabsTrigger>
                        <TabsTrigger
                            value="output"
                            className="bg-transparent rounded-none shadow-none border-t-0 border-x-0 border-b-2 border-transparent data-[state=active]:border-[#2563eb] dark:data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-muted-foreground hover:text-foreground data-[state=active]:text-[#2563eb] dark:data-[state=active]:text-primary transition-all pb-2.5 px-1 font-bold text-xs cursor-pointer focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
                        >
                            Output Format
                        </TabsTrigger>
                        <TabsTrigger
                            value="constraints"
                            className="bg-transparent rounded-none shadow-none border-t-0 border-x-0 border-b-2 border-transparent data-[state=active]:border-[#2563eb] dark:data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-muted-foreground hover:text-foreground data-[state=active]:text-[#2563eb] dark:data-[state=active]:text-primary transition-all pb-2.5 px-1 font-bold text-xs cursor-pointer focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
                        >
                            Constraints
                        </TabsTrigger>
                        <TabsTrigger
                            value="notes"
                            className="bg-transparent rounded-none shadow-none border-t-0 border-x-0 border-b-2 border-transparent data-[state=active]:border-[#2563eb] dark:data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-muted-foreground hover:text-foreground data-[state=active]:text-[#2563eb] dark:data-[state=active]:text-primary transition-all pb-2.5 px-1 font-bold text-xs cursor-pointer focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
                        >
                            Notes (Hidden)
                        </TabsTrigger>
                    </TabsList>
                </div>

                <div className="flex flex-col border border-border/60 rounded-xl bg-card shadow-sm transition-all duration-200 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50">
                    <TiptapToolbar />
                    <div className="resize-y overflow-y-auto bg-background/50 custom-scrollbar min-h-[300px] h-[480px] max-h-[80vh]">
                        <EditorContent editor={editor} />
                    </div>
                </div>
            </Tabs>
        </motion.div>
    );
}
