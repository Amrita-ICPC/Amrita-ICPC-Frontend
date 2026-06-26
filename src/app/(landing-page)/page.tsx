import { redirect } from "next/navigation";

import { OfficialLanding } from "@/components/landing/official-landing";
import { auth } from "@/lib/auth/auth";
import { getDefaultRoute } from "@/lib/auth/utils";

export default async function LandingPage() {
    const session = await auth();
    if (session?.user) {
        redirect(getDefaultRoute(session.user));
    }

    return <OfficialLanding />;
}
