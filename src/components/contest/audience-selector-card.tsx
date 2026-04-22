"use client";

import { useMemo, useState } from "react";
import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";
import { Search, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

import { useDebounce } from "@/hooks/use-debounce";
import { useUserAudiences } from "@/query/user-query";
import { toApiError } from "@/lib/api/error";

function formatAudienceType(type: string) {
    return type.replaceAll("_", " ").replaceAll("-", " ");
}

type AudienceSelectorCardProps<TFieldValues extends FieldValues> = {
    control: Control<TFieldValues>;
    name: FieldPath<TFieldValues>;
};

export function AudienceSelectorCard<TFieldValues extends FieldValues>({
    control,
    name,
}: AudienceSelectorCardProps<TFieldValues>) {
    const [audienceSearch, setAudienceSearch] = useState("");
    const debouncedAudienceSearch = useDebounce(audienceSearch, 300);

    const audiencesQuery = useUserAudiences({
        page: 1,
        page_size: 50,
        ...(debouncedAudienceSearch.trim() ? { q: debouncedAudienceSearch.trim() } : {}),
    });

    const audiences = useMemo(() => audiencesQuery.data?.data ?? [], [audiencesQuery.data?.data]);
    const audienceLookup = useMemo(() => {
        return audiences.reduce<Record<string, (typeof audiences)[number]>>((acc, audience) => {
            acc[audience.id] = audience;
            return acc;
        }, {});
    }, [audiences]);

    return (
        <Card>
            <CardHeader className="space-y-1">
                <CardTitle>Audience</CardTitle>
                <CardDescription>Link audiences to control access and visibility.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
                    <Input
                        value={audienceSearch}
                        onChange={(e) => setAudienceSearch(e.target.value)}
                        placeholder="Search your audiences…"
                        className="h-10 pl-9"
                    />
                </div>

                <Controller
                    control={control}
                    name={name}
                    render={({ field }) => {
                        const selectedIds = (field.value as unknown as string[]) ?? [];

                        const toggleAudience = (audienceId: string) => {
                            const next = new Set(selectedIds);
                            if (next.has(audienceId)) next.delete(audienceId);
                            else next.add(audienceId);
                            field.onChange(Array.from(next));
                        };

                        const removeAudience = (audienceId: string) => {
                            if (!selectedIds.includes(audienceId)) return;
                            field.onChange(selectedIds.filter((id) => id !== audienceId));
                        };

                        return (
                            <div className="space-y-3">
                                {selectedIds.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {selectedIds.map((id) => {
                                            const audience = audienceLookup[id];
                                            const label = audience?.name ?? id;
                                            const type = audience?.type
                                                ? formatAudienceType(String(audience.type))
                                                : null;

                                            return (
                                                <Badge
                                                    key={id}
                                                    variant="secondary"
                                                    className="flex max-w-full items-center gap-1"
                                                >
                                                    <span className="max-w-[160px] truncate">
                                                        {label}
                                                    </span>
                                                    {type ? (
                                                        <span className="text-muted-foreground">
                                                            • {type}
                                                        </span>
                                                    ) : null}
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon-xs"
                                                        className="-mr-1 ml-1"
                                                        onClick={() => removeAudience(id)}
                                                        aria-label="Remove audience"
                                                    >
                                                        <X />
                                                    </Button>
                                                </Badge>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-xs text-muted-foreground">
                                        No audiences selected.
                                    </p>
                                )}

                                <div className="rounded-md border bg-muted/10">
                                    <ScrollArea className="h-56">
                                        <div className="p-2">
                                            {audiencesQuery.isLoading ? (
                                                <div className="space-y-2">
                                                    {Array.from({ length: 6 }).map((_, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="flex items-center gap-3 rounded-md px-2 py-2"
                                                        >
                                                            <Skeleton className="h-4 w-4 rounded-sm" />
                                                            <div className="flex-1 space-y-1">
                                                                <Skeleton className="h-4 w-32" />
                                                                <Skeleton className="h-3 w-20" />
                                                            </div>
                                                            <Skeleton className="h-5 w-16 rounded-full" />
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : audiencesQuery.isError ? (
                                                <div className="flex flex-col items-start gap-2 rounded-md p-2">
                                                    <p className="text-sm font-medium text-destructive">
                                                        Failed to load audiences
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {toApiError(audiencesQuery.error).message ??
                                                            "Please try again."}
                                                    </p>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => audiencesQuery.refetch()}
                                                    >
                                                        Retry
                                                    </Button>
                                                </div>
                                            ) : audiences.length === 0 ? (
                                                <div className="flex items-center justify-center p-6 text-sm text-muted-foreground">
                                                    No audiences found.
                                                </div>
                                            ) : (
                                                <div className="space-y-1">
                                                    {audiences.map((audience) => {
                                                        const isSelected = selectedIds.includes(
                                                            audience.id,
                                                        );

                                                        return (
                                                            <Button
                                                                key={audience.id}
                                                                type="button"
                                                                variant="ghost"
                                                                asChild
                                                                className="h-auto w-full justify-start gap-3 rounded-md px-2 py-2"
                                                                onClick={() =>
                                                                    toggleAudience(audience.id)
                                                                }
                                                            >
                                                                <div
                                                                    role="button"
                                                                    tabIndex={0}
                                                                    className="flex w-full items-center gap-3 text-left"
                                                                    onClick={() =>
                                                                        toggleAudience(audience.id)
                                                                    }
                                                                    onKeyDown={(e) => {
                                                                        if (
                                                                            e.key === "Enter" ||
                                                                            e.key === " "
                                                                        ) {
                                                                            e.preventDefault();
                                                                            toggleAudience(
                                                                                audience.id,
                                                                            );
                                                                        }
                                                                    }}
                                                                >
                                                                    <Checkbox
                                                                        checked={isSelected}
                                                                        onCheckedChange={() =>
                                                                            toggleAudience(
                                                                                audience.id,
                                                                            )
                                                                        }
                                                                        onClick={(e) =>
                                                                            e.stopPropagation()
                                                                        }
                                                                        className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground border-primary/40"
                                                                    />
                                                                    <div className="min-w-0 flex-1">
                                                                        <p className="truncate text-sm font-medium text-foreground">
                                                                            {audience.name}
                                                                        </p>
                                                                        <p className="text-xs text-muted-foreground capitalize">
                                                                            {formatAudienceType(
                                                                                String(
                                                                                    audience.type,
                                                                                ),
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="capitalize"
                                                                    >
                                                                        {formatAudienceType(
                                                                            String(audience.type),
                                                                        )}
                                                                    </Badge>
                                                                </div>
                                                            </Button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </ScrollArea>
                                </div>
                            </div>
                        );
                    }}
                />
            </CardContent>
        </Card>
    );
}
