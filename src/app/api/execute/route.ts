import { NextRequest, NextResponse } from "next/server";

const JUDGE0_URL = process.env.JUDGE0_API_URL ?? "http://10.10.10.23:2358";

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { source_code, language_id, stdin } = body;

    if (!source_code || !language_id) {
        return NextResponse.json({ error: "source_code and language_id required" }, { status: 400 });
    }

    try {
        const res = await fetch(`${JUDGE0_URL}/submissions?wait=true&base64_encoded=false`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ source_code, language_id, stdin: stdin ?? "" }),
        });

        if (!res.ok) {
            const text = await res.text();
            return NextResponse.json({ error: `Judge0 error: ${text}` }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to reach Judge0";
        return NextResponse.json({ error: msg }, { status: 502 });
    }
}
