import "next-auth";
import { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
    interface Session {
        accessToken?: string;
        refreshToken?: string;
        user: {
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
    interface JWT {
        accessToken?: string;
        refreshToken?: string;
        roles?: string[];
        groups?: string[];
    }
}
