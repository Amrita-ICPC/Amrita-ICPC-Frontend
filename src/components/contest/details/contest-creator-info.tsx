import { Mail, Phone, Shield, UserCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { InstructorResponse } from "@/api/generated/model";

interface ContestCreatorInfoProps {
    creator: InstructorResponse;
}

export function ContestCreatorInfo({ creator }: ContestCreatorInfoProps) {
    const formatDate = (dateString?: string | null) => {
        if (!dateString) return "Not provided";
        try {
            return format(new Date(dateString), "MMM dd, yyyy");
        } catch {
            return "Invalid date";
        }
    };

    return (
        <Card className="border-border/60 shadow-sm rounded-2xl overflow-hidden bg-card h-full flex flex-col">
            <CardHeader className="bg-muted/30 pb-4 shrink-0">
                <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">
                            {creator.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="space-y-0.5">
                        <CardTitle className="text-base font-bold">{creator.name}</CardTitle>
                        <Badge
                            variant="secondary"
                            className="h-5 text-[10px] gap-1 font-bold uppercase tracking-wider"
                        >
                            <Shield className="h-3 w-3" />
                            {creator.role}
                        </Badge>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-4 space-y-4 flex-1">
                <div className="grid gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100 shadow-xs">
                            <Mail className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[9px] text-muted-foreground font-bold uppercase leading-none mb-1">
                                Email
                            </p>
                            <p className="text-xs font-bold text-foreground truncate">
                                {creator.email}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-xs">
                            <Phone className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[9px] text-muted-foreground font-bold uppercase leading-none mb-1">
                                Phone
                            </p>
                            <p className="text-xs font-bold text-foreground">
                                {creator.phone_no || "N/A"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-xs">
                            <UserCircle className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[9px] text-muted-foreground font-bold uppercase leading-none mb-1">
                                Gender
                            </p>
                            <p className="text-xs font-bold text-foreground capitalize">
                                {creator.gender?.toLowerCase() || "N/A"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-100 shadow-xs">
                            <Clock className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[9px] text-muted-foreground font-bold uppercase leading-none mb-1">
                                Joined
                            </p>
                            <p className="text-xs font-bold text-foreground">
                                {formatDate(creator.created_at)}
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
