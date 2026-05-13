import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import LoginClient from "./login-client";

import { getDefaultRoute } from "@/lib/auth/utils";

export default async function LoginPage() {
    const session = await auth();

    if (session?.user && !session.error) {
        redirect(getDefaultRoute(session.user));
    }

    return <LoginClient />;
}
