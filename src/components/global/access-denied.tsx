"use client";

import { ShieldAlert, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function AccessDenied() {
    const router = useRouter();

    return (
        <div className="flex min-h-[400px] w-full items-center justify-center p-4">
            <Card className="max-w-md border-destructive/20 bg-background/50 backdrop-blur-xl transition-all hover:border-destructive/40">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive shadow-lg shadow-destructive/10 animate-pulse">
                        <ShieldAlert size={32} />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                        Access Denied
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    <p className="text-muted-foreground">
                        You don't have the required permissions to access this page. Please contact your administrator if you believe this is an error.
                    </p>
                    <div className="rounded-lg bg-muted/30 p-3 text-xs text-muted-foreground/80 border border-muted/50">
                        Error Code: 403 Forbidden | RBAC Enforcement Active
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2 sm:flex-row justify-center pt-4">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="w-full sm:w-auto hover:bg-muted"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Go Back
                    </Button>
                    <Button
                        variant="default"
                        onClick={() => router.push("/")}
                        className="w-full sm:w-auto bg-primary hover:bg-primary/90 shadow-sm"
                    >
                        <Home className="mr-2 h-4 w-4" />
                        Return Home
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
