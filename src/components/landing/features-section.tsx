"use client";

import { Code2, Database, type LucideIcon, Trophy, Users } from "lucide-react";

import { Card } from "@/components/ui/card";
import { useInView } from "@/hooks/use-in-view";

interface Feature {
    icon: LucideIcon;
    color: string;
    bg: string;
    name: string;
    description: string;
    tags: string[];
}

const FEATURES: Feature[] = [
    {
        icon: Trophy,
        color: "#6f97ff",
        bg: "rgba(111,151,255,.1)",
        name: "Live Contests",
        description:
            "Schedule and run real-time programming contests with instant judging, live leaderboards, and team-based participation.",
        tags: ["Multi-language", "Team-based", "Live scores"],
    },
    {
        icon: Database,
        color: "#14b8a6",
        bg: "rgba(20,184,166,.1)",
        name: "Question Banks",
        description:
            "Author, tag, and version-control problems across difficulty levels. Clone and remix banks between contests.",
        tags: ["Difficulty levels", "Tag system", "Versioned"],
    },
    {
        icon: Users,
        color: "#a78bfa",
        bg: "rgba(167,139,250,.1)",
        name: "Team Management",
        description:
            "Students self-register teams, managers approve. Track performance per team across all contests and submissions.",
        tags: ["Self-registration", "Approval flow", "Analytics"],
    },
    {
        icon: Code2,
        color: "#22d3ee",
        bg: "rgba(34,211,238,.1)",
        name: "Multi-language Judge",
        description:
            "C++ · Python · Java execution via Judge0. Per-problem time & memory limits with diff-based output checking.",
        tags: ["C++ 17", "Python 3", "Java 17"],
    },
];

export function FeaturesSection() {
    const { ref, inView } = useInView<HTMLElement>(0.12);

    return (
        <section
            id="features"
            ref={ref}
            className={`landing-features landing-reveal ${inView ? "is-in" : ""}`}
        >
            <div className="landing-eyebrow">Platform capabilities</div>
            <h2 className="landing-sec-title">Everything a coding contest needs</h2>
            <p className="landing-sec-sub">
                Built for Amrita&apos;s competitive programming community — instructors, students,
                and contest managers.
            </p>

            <div className="landing-feat-grid">
                {FEATURES.map((feature) => (
                    <Card key={feature.name} className="landing-feat-card">
                        <div
                            className="landing-feat-icon"
                            style={{ background: feature.bg, color: feature.color }}
                        >
                            <feature.icon className="size-[22px]" />
                        </div>
                        <h3 className="landing-feat-name">{feature.name}</h3>
                        <p className="landing-feat-desc">{feature.description}</p>
                        <div className="landing-feat-tags">
                            {feature.tags.map((tag) => (
                                <span key={tag} className="landing-feat-tag">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </Card>
                ))}
            </div>
        </section>
    );
}
