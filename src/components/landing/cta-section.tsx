"use client";

import { Zap } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useInView } from "@/hooks/use-in-view";

export function CtaSection() {
    const { ref, inView } = useInView<HTMLElement>(0.12);

    return (
        <section
            id="cta"
            ref={ref}
            className={`landing-cta landing-reveal ${inView ? "is-in" : ""}`}
        >
            <div className="landing-cta-glow" />

            <div className="landing-eyebrow landing-cta-eyebrow">Ready to compete?</div>
            <h2 className="landing-cta-title">
                Code. Submit. <em>Climb.</em>
            </h2>
            <p className="landing-cta-sub">
                Join thousands of students solving, competing, and growing on Amrita ICPC.
            </p>

            <div className="landing-cta-btns">
                <Button asChild className="landing-btn-primary">
                    <Link href="/auth/login">
                        <Zap className="size-3.5" />
                        Get started — it&apos;s free
                    </Link>
                </Button>
                <Button asChild variant="outline" className="landing-btn-outline">
                    <a href="#features">Browse features</a>
                </Button>
            </div>
        </section>
    );
}
