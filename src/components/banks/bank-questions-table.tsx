"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";
import { QuestionListSummaryResponse } from "@/api/generated/model";

interface BankQuestionsTableProps {
    bankId: string;
    questions: QuestionListSummaryResponse[];
    onRemove: (questionId: string) => void;
    isRemoving?: boolean;
}

export function BankQuestionsTable({
    bankId,
    questions,
    onRemove,
    isRemoving,
}: BankQuestionsTableProps) {
    if (questions.length === 0) {
        return (
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/5 p-8 text-center">
                <p className="text-lg font-semibold text-white/80">No questions in this bank</p>
                <p className="text-sm text-white/40 max-w-xs mt-2">
                    Start by creating a new question or adding existing ones to this bank.
                </p>
                <Button size="sm" asChild className="mt-4">
                    <Link href={`/banks/${bankId}/questions/create`}>Create First Question</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-white/10 bg-[#0f1117] overflow-hidden">
            <Table>
                <TableHeader className="bg-white/5">
                    <TableRow className="hover:bg-transparent border-white/10">
                        <TableHead className="text-white/60">Question</TableHead>
                        <TableHead className="text-white/60">Difficulty</TableHead>
                        <TableHead className="text-white/60">Languages</TableHead>
                        <TableHead className="text-right text-white/60">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {questions.map((question) => (
                        <TableRow key={question.id} className="border-white/10 hover:bg-white/5 transition-colors group">
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-semibold text-white group-hover:text-primary transition-colors">
                                        {question.question_text.split("\n")[0].substring(0, 60)}
                                        {question.question_text.length > 60 ? "..." : ""}
                                    </span>
                                    <span className="text-xs text-white/30 font-mono mt-1">
                                        ID: {question.id.substring(0, 8)}...
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge
                                    variant="outline"
                                    className={`${
                                        question.difficulty === "EASY"
                                            ? "border-green-500/50 text-green-400 bg-green-500/5"
                                            : question.difficulty === "MEDIUM"
                                              ? "border-yellow-500/50 text-yellow-400 bg-yellow-500/5"
                                              : "border-red-500/50 text-red-400 bg-red-500/5"
                                    }`}
                                >
                                    {question.difficulty}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-wrap gap-1">
                                    {question.allowed_languages?.slice(0, 3).map((lang) => (
                                        <Badge
                                            key={lang}
                                            variant="secondary"
                                            className="bg-white/5 text-[10px] text-white/60 border-white/5"
                                        >
                                            {lang}
                                        </Badge>
                                    ))}
                                    {(question.allowed_languages?.length || 0) > 3 && (
                                        <span className="text-[10px] text-white/30 ml-1">
                                            +{question.allowed_languages!.length - 3} more
                                        </span>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        asChild
                                        className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/5"
                                    >
                                        <Link href={`/questions/${question.id}`}>
                                            <ExternalLink className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onRemove(question.id)}
                                        disabled={isRemoving}
                                        className="h-8 w-8 text-white/40 hover:text-red-400 hover:bg-red-500/10"
                                    >
                                        {isRemoving ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
