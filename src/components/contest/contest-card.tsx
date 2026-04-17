import { Calendar, Users, ArrowRight } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Contest } from "@/types/contest";

interface ContestCardProps {
    contest: Contest;
}

export function ContestCard({ contest }: ContestCardProps) {
    const startDate = new Date(contest.start_time).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
    const endDate = new Date(contest.end_time).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    const [imageError, setImageError] = useState(false);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "RUNNING":
                return "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20";
            case "SCHEDULED":
                return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
            case "FINISHED":
                return "bg-zinc-500/10 text-zinc-500 hover:bg-zinc-500/20";
            default:
                return "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20";
        }
    };

    return (
        <Card className="group flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-white/5 border-transparent bg-gradient-to-b from-card to-card/50">
            <div className="relative aspect-video w-full overflow-hidden bg-muted">
                {contest.image && !imageError ? (
                    <>
                        <Image
                            src={contest.image}
                            alt={contest.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={() => setImageError(true)}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80" />
                    </>
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
                        <Calendar className="h-12 w-12 text-muted-foreground/30 transition-transform duration-500 group-hover:scale-110" />
                    </div>
                )}
                <div className="absolute right-3 top-3">
                    <Badge
                        variant="outline"
                        className={`border-transparent backdrop-blur-md font-semibold tracking-wide ${getStatusColor(contest.status)}`}
                    >
                        {contest.status.replace("_", " ")}
                    </Badge>
                </div>
            </div>

            <CardHeader className="p-5 pb-3">
                <h3 className="line-clamp-1 text-xl font-bold tracking-tight text-foreground/90 group-hover:text-primary transition-colors">
                    {contest.name}
                </h3>
                <p className="line-clamp-2 mt-1.5 text-sm text-muted-foreground/80 leading-relaxed">
                    {contest.description ||
                        "No specific details have been provided for this contest yet."}
                </p>
            </CardHeader>

            <CardContent className="flex-1 px-5 py-2">
                <div className="flex flex-col gap-3 text-sm font-medium text-muted-foreground/90">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Calendar className="h-4 w-4" />
                        </div>
                        <span>
                            {startDate} <span className="opacity-50 mx-1">—</span> {endDate}
                        </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Users className="h-4 w-4" />
                        </div>
                        <span className="capitalize">
                            {contest.team_approval_mode.replace("_", " ").toLowerCase()} Teams
                        </span>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="p-5 pt-4 border-t border-border/40">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="default"
                            className="w-full group/btn shadow-md hover:shadow-lg transition-all"
                        >
                            View Details
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Explore contest info and rules</p>
                    </TooltipContent>
                </Tooltip>
            </CardFooter>
        </Card>
    );
}
