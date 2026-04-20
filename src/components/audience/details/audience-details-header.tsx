import Link from "next/link";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function AudienceDetailsHeader({
    audienceName,
    audienceType,
    description,
    isLoading,
    actions,
}: {
    audienceName: string | null | undefined;
    audienceType: string | null | undefined;
    description: string | null | undefined;
    isLoading: boolean;
    actions: ReactNode;
}) {
    return (
        <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/audiences">Audiences</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>
                                {isLoading ? (
                                    <span className="inline-block h-5 w-44 rounded bg-muted" />
                                ) : (
                                    (audienceName ?? "Audience")
                                )}
                            </BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-bold tracking-tight">
                        {isLoading ? (
                            <span className="inline-block h-8 w-56 rounded bg-muted" />
                        ) : (
                            (audienceName ?? "Audience")
                        )}
                    </h1>

                    {audienceType ? (
                        <Badge variant="secondary" className="text-[11px]">
                            {String(audienceType).toUpperCase()}
                        </Badge>
                    ) : null}
                </div>

                {description ? (
                    <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
                ) : (
                    <p className="max-w-2xl text-sm text-muted-foreground">
                        Manage members and view role distribution for this audience.
                    </p>
                )}
            </div>

            <div className="flex flex-col items-end gap-2">{actions}</div>
        </div>
    );
}
