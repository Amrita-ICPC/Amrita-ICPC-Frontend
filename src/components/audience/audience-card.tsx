"use client";

import { UsersRound } from "lucide-react";

import type { AudienceResponse } from "@/api/generated/model";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

function formatAudienceType(value: string) {
    return value.replace(/_/g, " ").toUpperCase();
}

export function AudienceCard({ audience }: { audience: AudienceResponse }) {
    return (
        <Card className="flex flex-col overflow-hidden">
            <CardHeader className="p-3 pb-1">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h3 className="line-clamp-1 text-base font-semibold tracking-tight">
                            {audience.name}
                        </h3>
                        {audience.description ? (
                            <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                                {audience.description}
                            </p>
                        ) : null}
                    </div>

                    <Badge variant="secondary" className="shrink-0 text-[11px]">
                        {formatAudienceType(String(audience.audience_type))}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="p-3 pt-2">
                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center justify-between rounded-md bg-muted/50 px-2.5 py-1.5">
                        <span className="text-muted-foreground">Managers</span>
                        <span className="font-semibold">{audience.manager_count ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-md bg-muted/50 px-2.5 py-1.5">
                        <span className="text-muted-foreground">Instructors</span>
                        <span className="font-semibold">{audience.instructor_count ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-md bg-muted/50 px-2.5 py-1.5">
                        <span className="text-muted-foreground">Students</span>
                        <span className="font-semibold">{audience.student_count ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-md bg-muted/50 px-2.5 py-1.5">
                        <span className="text-muted-foreground">Total</span>
                        <span className="font-semibold">{audience.total_users ?? 0}</span>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="p-3 pt-0">
                <Button type="button" variant="outline" size="sm" className="w-full" disabled>
                    <UsersRound className="mr-2 h-3.5 w-3.5" />
                    View Users
                </Button>
            </CardFooter>
        </Card>
    );
}
