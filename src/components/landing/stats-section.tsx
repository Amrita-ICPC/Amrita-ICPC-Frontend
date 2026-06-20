"use client";

import { AnimatedCounter } from "@/components/landing/animated-counter";
import { useInView } from "@/hooks/use-in-view";

const STATS = [
    { target: 5019, suffix: "+", label: "Submissions today" },
    { target: 299, suffix: "", label: "Registered teams" },
    { target: 1284, suffix: "+", label: "Problems in bank" },
    { target: 12, suffix: "", label: "Live contests now" },
];

export function StatsSection() {
    const { ref, inView } = useInView<HTMLElement>(0.12);

    return (
        <section
            id="stats"
            ref={ref}
            className={`landing-stats landing-reveal ${inView ? "is-in" : ""}`}
        >
            <div className="landing-stats-grid">
                {STATS.map((stat) => (
                    <div key={stat.label} className="landing-stat-cell">
                        <AnimatedCounter
                            target={stat.target}
                            suffix={stat.suffix}
                            start={inView}
                            className="landing-stat-big"
                        />
                        <span className="landing-stat-lbl">{stat.label}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}
