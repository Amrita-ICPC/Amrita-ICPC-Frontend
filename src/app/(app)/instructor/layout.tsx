/**
 * Instructor section layout
 * Common layout for all instructor pages
 */

import { ReactNode } from "react";

export default function InstructorLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</div>
        </div>
    );
}
