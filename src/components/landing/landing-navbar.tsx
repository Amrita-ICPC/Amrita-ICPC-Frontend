"use client";

import { LogIn } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export function LandingNavbar() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        function onScroll() {
            setScrolled(window.scrollY > 20);
        }
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <nav className={`landing-nav ${scrolled ? "is-glassy" : ""}`}>
            <Link href="#" className="landing-logo">
                <div className="landing-logo-mark">IC</div>
                <div>
                    <div className="landing-logo-name">ICPC Platform</div>
                    <div className="landing-logo-sub">Amrita University</div>
                </div>
            </Link>

            <Button asChild size="sm" className="landing-nav-cta">
                <Link href="/auth/login">
                    <LogIn className="size-3.5" />
                    Sign In
                </Link>
            </Button>
        </nav>
    );
}
