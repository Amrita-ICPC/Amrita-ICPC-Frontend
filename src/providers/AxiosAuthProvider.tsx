"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { setAxiosToken } from "@/lib/api-client";

/**
 * Axios Auth Provider
 * 
 * Passively syncs the NextAuth session token into the global Axios instance.
 * This prevents the Axios interceptor from having to make a network call
 * (via getSession()) on every single outgoing API request.
 */
export function AxiosAuthProvider({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();

    useEffect(() => {
        if (session?.accessToken) {
            setAxiosToken(session.accessToken);
        } else {
            setAxiosToken(null);
        }
    }, [session?.accessToken]);

    return <>{children}</>;
}
