import { DefaultSession } from "next-auth";
import { JWT as NextAuthJWT } from "next-auth/jwt";

declare module "next-auth" {
    interface Session extends DefaultSession {
        accessToken?: string;
        error?: string;
        user: {
            id?: string;
            roles?: string[];
            groups?: string[];
        } & DefaultSession["user"];
    }

    interface User {
        roles?: string[];
        groups?: string[];
    }
}

declare module "next-auth/jwt" {
    interface JWT extends NextAuthJWT {
        accessToken?: string;
        refreshToken?: string;
        expiresAt?: number;
        roles?: string[];
        groups?: string[];
        error?: string;
        provider?: string;
    }
}
