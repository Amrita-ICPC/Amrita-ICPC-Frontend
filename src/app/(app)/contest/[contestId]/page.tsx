"use client";

import { use } from "react";
import { useContestDetail } from "@/query/contest-query";
import { ContestOverviewHero } from "@/components/contest/details/ContestOverviewHero";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ContestMainContent } from "@/components/contest/details/contest-main-content";

interface ContestPageProps {
    params: Promise<{ contestId: string }>;
}

export default function ContestDetailsPage({ params }: ContestPageProps) {
    const { contestId } = use(params);
    const { data: contest, isLoading, error, refetch } = useContestDetail(contestId);

    if (isLoading) {
        return (
            <div className="flex flex-col gap-6 md:gap-10 p-4 sm:p-6 md:p-8 lg:p-10 xl:px-16 2xl:px-24 w-full animate-pulse">
                <Skeleton className="h-8 w-64" />
                <Card>
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-6 mb-6">
                            <Skeleton className="w-full md:w-72 aspect-video rounded-md" />
                            <div className="flex-1 space-y-4">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-20 w-full" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Skeleton className="h-12 w-full" />
                <div className="space-y-8 mt-8">
                    <div className="grid grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-24" />
                        ))}
                    </div>
                    <Skeleton className="h-48 w-full" />
                </div>
            </div>
        );
    }

    if (error || !contest) {
        return (
            <div className="flex h-full items-center justify-center p-8">
                <Alert variant="destructive" className="max-w-md shadow-lg border-2">
                    <AlertCircle className="h-5 w-5" />
                    <AlertTitle className="text-lg font-bold">Failed to load contest</AlertTitle>
                    <AlertDescription className="mt-2 text-sm opacity-90">
                        {error instanceof Error
                            ? error.message
                            : "The contest you are looking for might not exist or you don't have permission to view it."}
                    </AlertDescription>
                    <div className="mt-4 flex justify-end">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => refetch()}
                            className="bg-white hover:bg-slate-50 text-destructive border-destructive/20"
                        >
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            Try Again
                        </Button>
                    </div>
                </Alert>
            </div>
        );
    }

    return (
        <main className="flex flex-col gap-6 md:gap-10 p-4 sm:p-6 md:p-8 lg:p-10 xl:px-16 2xl:px-24 w-full animate-in fade-in duration-700 pb-20">
            <div className="flex justify-end"></div>
            <ContestOverviewHero
                contest={contest}
                onPublish={() => console.log("Publish contest", contestId)}
            />

            <Separator className="opacity-60" />

            <ContestMainContent contest={contest} />
        </main>
    );
}
