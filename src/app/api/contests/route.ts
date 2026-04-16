import { NextRequest, NextResponse } from "next/server";

import { getContestsServer } from "@/server/services/contest-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        const params = Object.fromEntries(req.nextUrl.searchParams);
        const data = await getContestsServer(params);
        return NextResponse.json(data, {
            headers: {
                "Cache-Control": "no-store, max-age=0",
            },
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ message }, { status: 500 });
    }
}
