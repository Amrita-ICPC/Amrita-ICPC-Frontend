"use client";

import { Code2, FileCode2, LucideIcon, Trophy, Users } from "lucide-react";
import { useState } from "react";

interface FeatureCard {
    icon: LucideIcon;
    title: string;
    description: string;
}

const features: FeatureCard[] = [
    {
        icon: Trophy,
        title: "Live Contests",
        description: "Real-time competitive programming contests with instant feedback.",
    },
    {
        icon: FileCode2,
        title: "Question Banks",
        description: "Curated collections of programming problems for practice.",
    },
    {
        icon: Users,
        title: "Team Management",
        description: "Organize teams, track performance, and manage participants.",
    },
    {
        icon: Code2,
        title: "Multi-language Execution",
        description: "Support for multiple programming languages and compilers.",
    },
];

export function FeatureCards() {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" style={{ gap: "24px" }}>
            {features.map(({ icon: Icon, title, description }, index) => (
                <div
                    key={title}
                    className="group rounded-[20px] border border-sidebar-border bg-sidebar-accent/30 p-6 transition-all duration-300 hover:-translate-y-1"
                    style={{
                        borderColor:
                            hoveredIndex === index
                                ? "var(--sidebar-primary)"
                                : "var(--sidebar-border)",
                    }}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                >
                    {/* Icon Container */}
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-sidebar-primary/10">
                        <Icon className="h-6 w-6 text-sidebar-primary" />
                    </div>

                    {/* Card Title */}
                    <h3 className="text-base font-semibold text-sidebar-foreground">{title}</h3>

                    {/* Card Description */}
                    <p className="mt-2 leading-relaxed text-sidebar-foreground/65 text-sm">
                        {description}
                    </p>
                </div>
            ))}
        </div>
    );
}
