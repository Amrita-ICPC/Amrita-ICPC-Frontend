"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Sigma, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { ScrollArea } from "../ui/scroll-area";

const SYMBOL_GROUPS = [
    {
        name: "Basic",
        symbols: [
            { label: "±", latex: "\\pm" },
            { label: "×", latex: "\\times" },
            { label: "÷", latex: "\\div" },
            { label: "≠", latex: "\\neq" },
            { label: "≈", latex: "\\approx" },
            { label: "≡", latex: "\\equiv" },
            { label: "∞", latex: "\\infty" },
            { label: "√", latex: "\\sqrt{}" },
        ],
    },
    {
        name: "Comparison",
        symbols: [
            { label: "≤", latex: "\\le" },
            { label: "≥", latex: "\\ge" },
            { label: "≪", latex: "\\ll" },
            { label: "≫", latex: "\\gg" },
            { label: "∈", latex: "\\in" },
            { label: "∉", latex: "\\notin" },
            { label: "⊂", latex: "\\subset" },
            { label: "⊆", latex: "\\subseteq" },
        ],
    },
    {
        name: "Greek",
        symbols: [
            { label: "α", latex: "\\alpha" },
            { label: "β", latex: "\\beta" },
            { label: "γ", latex: "\\gamma" },
            { label: "δ", latex: "\\delta" },
            { label: "ε", latex: "\\epsilon" },
            { label: "π", latex: "\\pi" },
            { label: "σ", latex: "\\sigma" },
            { label: "ω", latex: "\\omega" },
            { label: "Δ", latex: "\\Delta" },
            { label: "Σ", latex: "\\sum" },
        ],
    },
    {
        name: "Arrows",
        symbols: [
            { label: "→", latex: "\\rightarrow" },
            { label: "←", latex: "\\leftarrow" },
            { label: "⇒", latex: "\\Rightarrow" },
            { label: "⇔", latex: "\\Leftrightarrow" },
            { label: "↑", latex: "\\uparrow" },
            { label: "↓", latex: "\\downarrow" },
        ],
    },
];

interface MathSymbolPickerProps {
    onSelect: (latex: string) => void;
    trigger?: React.ReactNode;
}

export function MathSymbolPicker({ onSelect, trigger }: MathSymbolPickerProps) {
    const [search, setSearch] = useState("");

    const filteredGroups = SYMBOL_GROUPS.map((group) => ({
        ...group,
        symbols: group.symbols.filter(
            (s) =>
                s.label.toLowerCase().includes(search.toLowerCase()) ||
                s.latex.toLowerCase().includes(search.toLowerCase()),
        ),
    })).filter((group) => group.symbols.length > 0);

    return (
        <Popover>
            <PopoverTrigger asChild>
                {trigger || (
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Sigma className="h-4 w-4" />
                    </Button>
                )}
            </PopoverTrigger>
            <PopoverContent
                className="w-80 p-0 shadow-2xl border-border/40 bg-background/95 backdrop-blur-md"
                side="top"
            >
                <div className="p-3 border-b border-border/40">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search symbols..."
                            className="pl-8 h-9 text-sm bg-muted/30"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <ScrollArea className="h-64">
                    <div className="p-3">
                        {filteredGroups.length > 0 ? (
                            <div className="space-y-4">
                                {filteredGroups.map((group) => (
                                    <div key={group.name} className="space-y-2">
                                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">
                                            {group.name}
                                        </h4>
                                        <div className="grid grid-cols-6 gap-1">
                                            {group.symbols.map((symbol) => (
                                                <Button
                                                    key={symbol.latex}
                                                    variant="ghost"
                                                    className="h-9 w-9 p-0 text-sm hover:bg-primary/10 hover:text-primary transition-colors"
                                                    onClick={() => onSelect(symbol.latex)}
                                                    title={symbol.latex}
                                                >
                                                    {symbol.label}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center text-sm text-muted-foreground italic">
                                No symbols found.
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
