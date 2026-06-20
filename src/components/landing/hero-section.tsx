import { ArrowRight, Zap } from "lucide-react";
import Link from "next/link";

import { AnimatedCounter } from "@/components/landing/animated-counter";
import { CodePreviewCard } from "@/components/landing/code-preview-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const METRICS = [
    { target: 299, suffix: "", label: "Registered teams" },
    { target: 1284, suffix: "+", label: "Problems in bank" },
];

export function HeroSection() {
    return (
        <section className="landing-hero">
            <div className="landing-hero-glow" />

            <div className="landing-hero-left">
                <Badge className="landing-badge">
                    <span className="landing-live-dot" />
                    Competitive Programming Infrastructure
                </Badge>

                <h1 className="landing-h1">
                    <span className="landing-h1-plain">Amrita</span>
                    <span className="landing-h1-grad">ICPC</span>
                </h1>

                <p className="landing-hero-sub">
                    A unified contest &amp; exam platform — schedule live contests, build question
                    banks, and judge code at scale.
                </p>

                <div className="landing-hero-btns">
                    <Button asChild className="landing-btn-primary">
                        <Link href="/auth/login">
                            <Zap className="size-3.5" />
                            Enter Platform
                        </Link>
                    </Button>
                    <Button asChild variant="outline" className="landing-btn-outline">
                        <a href="#features">
                            Explore features
                            <ArrowRight className="size-3.5" />
                        </a>
                    </Button>
                </div>

                <div className="landing-hero-metrics">
                    {METRICS.map((metric, i) => (
                        <div key={metric.label} className="landing-metric-wrap">
                            {i > 0 && (
                                <Separator orientation="vertical" className="landing-metric-sep" />
                            )}
                            <div className="landing-metric">
                                <AnimatedCounter
                                    target={metric.target}
                                    suffix={metric.suffix}
                                    delay={280}
                                    className="landing-metric-val"
                                />
                                <span className="landing-metric-lbl">{metric.label}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="landing-hero-right">
                <CodePreviewCard />
            </div>
        </section>
    );
}
