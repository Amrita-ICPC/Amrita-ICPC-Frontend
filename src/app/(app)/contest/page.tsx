"use client";

import { AuthGuard } from "@/components/auth";
import { Card } from "@/components/ui/card";

export default function ContestPage() {
    return (
        <AuthGuard requiredRoles={["instructor", "admin"]}>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Contests</h1>
                    <p className="mt-2 text-white/60">Manage and monitor your contests</p>
                </div>

                <Card className="border border-white/10 bg-white/5 p-6">
                    <p className="text-white/70">
                        This page is only accessible to instructors and admins. AuthGuard
                        automatically checks user permissions and shows an access denied message if
                        the user is not authorized.
                    </p>
                </Card>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Card className="border border-white/10 bg-white/5 p-6 hover:bg-white/8 transition cursor-pointer">
                        <h3 className="font-semibold text-white">Create Contest</h3>
                        <p className="mt-2 text-sm text-white/60">
                            Set up a new programming contest
                        </p>
                    </Card>

                    <Card className="border border-white/10 bg-white/5 p-6 hover:bg-white/8 transition cursor-pointer">
                        <h3 className="font-semibold text-white">View All Contests</h3>
                        <p className="mt-2 text-sm text-white/60">
                            Browse all contests you have created
                        </p>
                    </Card>
                </div>
            </div>
        </AuthGuard>
    );
}
