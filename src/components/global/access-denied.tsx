"use client";

import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AccessDenied() {
    const router = useRouter();

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-[#0b0d12] rounded-lg border border-red-900/30">
            <div className="p-4 mb-4 bg-red-900/20 rounded-full">
                <ShieldAlert className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-gray-400 mb-6 max-w-md">
                You do not have the required permissions to view this content. Please contact your
                administrator if you believe this is an error.
            </p>
            <div className="flex gap-4">
                <Button
                    variant="outline"
                    onClick={() => router.back()}
                    className="border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                    Go Back
                </Button>
                <Button
                    onClick={() => router.push("/")}
                    className="bg-red-600 hover:bg-red-700 text-white"
                >
                    Return Home
                </Button>
            </div>
        </div>
    );
}
