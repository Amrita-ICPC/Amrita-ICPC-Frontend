"use client";

import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { StudentCreateTeamDialog } from "@/components/student/student-create-team-dialog";
import { StudentInvitationsDrawer } from "@/components/student/student-invitations-drawer";

interface StudentTeamHeroProps {
    onJoinTeam?: () => void;
    pendingInvitations?: number;
}

export function StudentTeamHero({ onJoinTeam, pendingInvitations = 0 }: StudentTeamHeroProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950 text-white min-h-[220px] md:min-h-[240px] flex items-center shadow-xl"
        >
            {/* Ambient Background Gradients */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/95 to-indigo-950/20 z-0" />

            {/* Soft Radial Indigo Light Leak on Right */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-indigo-600/10 blur-[90px] z-0 pointer-events-none" />
            <div className="absolute right-1/3 bottom-0 w-[200px] h-[200px] rounded-full bg-blue-500/5 blur-[70px] z-0 pointer-events-none" />

            {/* Matrix / Radial Dot Grid Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:16px_16px] mix-blend-screen opacity-70 z-0" />

            <div className="relative w-full max-w-7xl mx-auto px-6 py-6 md:px-10 md:py-8 z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Left Side Content Stack */}
                <div className="lg:col-span-7 space-y-4 text-left flex flex-col justify-center">
                    <div className="space-y-2">
                        <motion.span
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black text-indigo-400 bg-indigo-500/10 uppercase tracking-widest border border-indigo-500/20 leading-none"
                        >
                            Amrita ICPC Portal
                        </motion.span>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-none">
                            My Teams
                        </h1>
                    </div>

                    <div className="space-y-1">
                        <p className="text-slate-100 text-sm md:text-base font-bold leading-snug">
                            Create, manage and collaborate with your team.
                        </p>
                        <p className="text-slate-400 text-[11px] md:text-xs font-semibold tracking-wide">
                            Build once, compete everywhere.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                        {/* Create Team — opens dialog */}
                        <StudentCreateTeamDialog />

                        <Button
                            onClick={
                                onJoinTeam ||
                                (() =>
                                    toast.info(
                                        "To join a team, please navigate to an active contest page.",
                                    ))
                            }
                            variant="outline"
                            className="bg-slate-900/60 backdrop-blur-md text-slate-100 hover:text-white gap-1.5 h-9 px-4.5 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90 transition-all font-extrabold text-xs rounded-lg"
                        >
                            <UserPlus className="h-4 w-4 stroke-[2]" />
                            Join Team
                        </Button>

                        {/* Team Invitations Drawer */}
                        <StudentInvitationsDrawer pendingCount={pendingInvitations} />
                    </div>
                </div>

                {/* Right Side Compact Illustration Panel */}
                <div className="hidden lg:flex lg:col-span-5 relative h-[180px] md:h-[220px] w-full justify-center items-center overflow-hidden">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="relative h-full w-full max-w-[280px] md:max-w-[320px] flex items-center justify-center"
                    >
                        {/* Soft background aura behind illustration */}
                        <div className="absolute inset-0 rounded-full bg-indigo-500/5 blur-xl scale-75 pointer-events-none" />

                        {/* Compact 3D Illustration */}
                        <img
                            src="/images/team_illustration.png"
                            alt="Student Team Coding and Collaborating"
                            className="h-full w-auto object-contain filter drop-shadow-[0_10px_20px_rgba(99,102,241,0.2)] rounded-xl hover:scale-[1.02] transition-transform duration-500"
                        />
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
