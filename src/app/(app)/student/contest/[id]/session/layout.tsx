"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useEffect } from "react";
import { toast } from "sonner";

import { useGetStudentContestStatusApiV1StudentsContestsContestIdParticipationMeGet } from "@/api/generated/students/students";
import { getContestSessionUnavailableMessage } from "@/lib/contest-session-status";
import { ContestSessionAppearanceProvider } from "@/lib/providers/contest-session-appearance-provider";
import { ContestSessionProvider } from "@/lib/providers/contest-session-provider";
import { SessionTimerProvider } from "@/lib/providers/session-timer-provider";

interface LayoutProps {
    children: React.ReactNode;
    params: Promise<{ id: string }>;
}

export default function SessionLayout({ children, params }: LayoutProps) {
    const { id } = use(params);
    const router = useRouter();

    const { data: statusRes, isLoading } =
        useGetStudentContestStatusApiV1StudentsContestsContestIdParticipationMeGet(id);
    const participation = statusRes?.data;

    useEffect(() => {
        if (!isLoading && participation) {
            const canStart = participation?.session?.can_start;
            if (!canStart) {
                const reason = getContestSessionUnavailableMessage(participation.session);
                toast.error(reason);
                router.replace(`/student/contest/${id}`);
            }
        }
    }, [participation, isLoading, id, router]);

    if (isLoading) {
        return (
            <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-[#090d16] flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                <span className="text-sm font-semibold tracking-wider uppercase">
                    Validating Coding Session...
                </span>
            </div>
        );
    }

    if (participation && !participation?.session?.can_start) {
        return (
            <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-[#090d16] flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                <span className="text-sm font-semibold tracking-wider uppercase">
                    Redirecting...
                </span>
            </div>
        );
    }

    return (
        <ContestSessionAppearanceProvider>
            <ContestSessionProvider contestId={id}>
                <SessionTimerProvider contestId={id}>{children}</SessionTimerProvider>
            </ContestSessionProvider>
        </ContestSessionAppearanceProvider>
    );
}
