import type { NextConfig } from "next";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const nextSafe = require("next-safe");

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "http",
                hostname: "10.10.10.23",
                port: "9000",
                pathname: "/**",
            },
            {
                protocol: "http",
                hostname: "localhost",
                port: "9000",
                pathname: "/**",
            },
        ],
    },
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
                        "img-src": isDev
                            ? "'self' data: blob: https: http://10.10.10.23:9000 http://localhost:9000"
                            : "'self' data: blob: https: http://10.10.10.23:9000",
                        "font-src": "'self' data:",
                        "connect-src": isDev
                            ? "'self' ws: wss: https: http://10.10.10.23:8000 http://localhost:8000"
                            : "'self' https:",
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
