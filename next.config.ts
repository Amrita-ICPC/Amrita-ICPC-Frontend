import type { NextConfig } from "next";
import nextSafe from "next-safe";

const nextConfig: NextConfig = {
    async headers() {
        const isDev = process.env.NODE_ENV !== "production";
        return [
            {
                source: "/:path*",
                headers: nextSafe({
                    isDev,
                    contentSecurityPolicy: {
                        "base-uri": "'self'",
                        "default-src": "'self'",
                        "script-src": isDev
                            ? "'self' 'unsafe-inline' 'unsafe-eval'"
                            : "'self' 'unsafe-inline'",
                        "style-src": "'self' 'unsafe-inline'",
                        "img-src": "'self' data: blob:",
                        "font-src": "'self' data:",
                        "connect-src": isDev ? "'self' ws: wss: https:" : "'self' https:",
                        "frame-ancestors": "'none'",
                        "object-src": "'none'",
                        "form-action": "'self'",
                    },
                }),
            },
        ];
    },
};

export default nextConfig;
