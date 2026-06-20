import { redirect } from "next/navigation";

import { AlgorithmMarquee } from "@/components/landing/algorithm-marquee";
import { FeaturesSection } from "@/components/landing/features-section";
import { HeroSection } from "@/components/landing/hero-section";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { ParticleNetwork } from "@/components/landing/particle-network";
import { auth } from "@/lib/auth/auth";
import { getDefaultRoute } from "@/lib/auth/utils";

export default async function LandingPage() {
    const session = await auth();
    if (session?.user) {
        redirect(getDefaultRoute(session.user));
    }

    return (
        <div className="landing-page">
            <ParticleNetwork />
            <LandingNavbar />
            <HeroSection />
            <AlgorithmMarquee />
            <FeaturesSection />
            <LandingFooter />
        </div>
    );
}
