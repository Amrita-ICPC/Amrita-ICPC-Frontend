"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface ParsedResult {
    header: string[];
    rows: string[][];
}

/**
 * Parses SQLite `.mode list` output (pipe-separated, header row first) into
 * columns/rows. Returns null when the text doesn't look like a consistent
 * grid (e.g. an error message), so callers can fall back to raw text.
 */
function parseSqliteListOutput(text: string): ParsedResult | null {
    const lines = text
        .replace(/\r\n/g, "\n")
        .split("\n")
        .map((l) => l.trimEnd())
        .filter((l) => l.length > 0);

    if (lines.length === 0) return { header: [], rows: [] };

    const header = lines[0].split("|");
    const rows = lines.slice(1).map((l) => l.split("|"));
    const consistent = rows.every((r) => r.length === header.length);
    if (!consistent) return null;

    return { header, rows };
}

interface SqlResultTableProps {
    text: string | null | undefined;
    className?: string;
    emptyLabel?: string;
}

/** Renders a SQLite result set as a table, falling back to raw text when it doesn't parse as a grid. */
export function SqlResultTable({
    text,
    className,
    emptyLabel = "No rows returned.",
}: SqlResultTableProps) {
    if (!text || !text.trim()) {
        return <p className="text-xs text-muted-foreground italic px-1">{emptyLabel}</p>;
    }

    const parsed = parseSqliteListOutput(text);

    if (!parsed) {
        return (
            <pre
                className={cn(
                    "whitespace-pre-wrap break-words rounded-lg border border-border/60 bg-muted/70 px-3 py-2 font-mono text-[11px] leading-tight text-foreground shadow-inner dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-100",
                    className,
                )}
            >
                {text}
            </pre>
        );
    }

    if (parsed.rows.length === 0 && parsed.header.length === 0) {
        return <p className="text-xs text-muted-foreground italic px-1">{emptyLabel}</p>;
    }

    return (
        <div
            className={cn(
                "rounded-lg border border-border/60 bg-background shadow-inner overflow-hidden",
                className,
            )}
        >
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        {parsed.header.map((col, i) => (
                            <TableHead key={i} className="font-mono text-[11px] font-semibold">
                                {col}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {parsed.rows.length === 0 ? (
                        <TableRow className="hover:bg-transparent">
                            <TableCell
                                colSpan={parsed.header.length || 1}
                                className="text-center text-xs text-muted-foreground italic"
                            >
                                {emptyLabel}
                            </TableCell>
                        </TableRow>
                    ) : (
                        parsed.rows.map((row, ri) => (
                            <TableRow key={ri}>
                                {row.map((cell, ci) =>
                                    cell === "NULL" ? (
                                        <TableCell
                                            key={ci}
                                            className="font-mono text-[11px] italic text-muted-foreground/60"
                                        >
                                            NULL
                                        </TableCell>
                                    ) : (
                                        <TableCell key={ci} className="font-mono text-[11px]">
                                            {cell}
                                        </TableCell>
                                    ),
                                )}
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
