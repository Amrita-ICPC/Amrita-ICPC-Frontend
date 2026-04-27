"use client";

import { X, Check, Hash, Plus } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Mock tags since API is missing
const MOCK_TAGS = [
    { id: "550e8400-e29b-41d4-a716-446655440000", name: "Dynamic Programming" },
    { id: "550e8400-e29b-41d4-a716-446655440001", name: "Graph Theory" },
    { id: "550e8400-e29b-41d4-a716-446655440002", name: "String Manipulation" },
    { id: "550e8400-e29b-41d4-a716-446655440003", name: "Math" },
    { id: "550e8400-e29b-41d4-a716-446655440004", name: "Greedy" },
    { id: "550e8400-e29b-41d4-a716-446655440005", name: "Sorting" },
];

interface TagSelectorProps {
    selectedTagIds: string[];
    onChange: (tagIds: string[]) => void;
}

export function TagSelector({ selectedTagIds, onChange }: TagSelectorProps) {
    const [open, setOpen] = useState(false);

    const toggleTag = (id: string) => {
        const newIds = selectedTagIds.includes(id)
            ? selectedTagIds.filter((t) => t !== id)
            : [...selectedTagIds, id];
        onChange(newIds);
    };

    const selectedTags = MOCK_TAGS.filter((t) => selectedTagIds.includes(t.id));

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                    <Badge
                        key={tag.id}
                        variant="secondary"
                        className="gap-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                    >
                        <Hash className="h-3 w-3" />
                        {tag.name}
                        <button
                            type="button"
                            className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            onClick={() => toggleTag(tag.id)}
                        >
                            <X className="h-3 w-3 text-primary/50 hover:text-primary" />
                        </button>
                    </Badge>
                ))}
            </div>

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between border-white/10 bg-white/5 text-white/60 hover:text-white"
                    >
                        {selectedTagIds.length > 0
                            ? `${selectedTagIds.length} tags selected`
                            : "Select tags..."}
                        <Plus className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 border-white/10 bg-[#161922]">
                    <Command className="bg-transparent text-white">
                        <CommandInput placeholder="Search tags..." className="text-white" />
                        <CommandList>
                            <CommandEmpty>No tags found.</CommandEmpty>
                            <CommandGroup>
                                {MOCK_TAGS.map((tag) => (
                                    <CommandItem
                                        key={tag.id}
                                        value={tag.name}
                                        onSelect={() => {
                                            toggleTag(tag.id);
                                        }}
                                        className="cursor-pointer aria-selected:bg-white/5"
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4 text-primary",
                                                selectedTagIds.includes(tag.id)
                                                    ? "opacity-100"
                                                    : "opacity-0",
                                            )}
                                        />
                                        {tag.name}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}
