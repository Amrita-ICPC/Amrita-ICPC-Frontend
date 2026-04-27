import type { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            roles: string[];
            groups: string[];
        } & DefaultSession["user"];
        access_token: string;
        error?: string | null;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        roles?: string[];
        access_token?: string;
        refresh_token?: string;
        id_token?: string;
        expires_at?: number;
        session_expires_at?: number;
        groups?: string[];
        id?: string;
        error?: string;
    }
}
