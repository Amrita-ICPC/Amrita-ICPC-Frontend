import type { NextConfig } from "next";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const nextSafe = require("next-safe");

const nextConfig: NextConfig = {
    async headers() {
        const isDev = process.env.NODE_ENV !== "production";
        return [
            {
                source: "/:path*",
                headers: nextSafe({
                    isDev,
                    permissionsPolicyDirectiveSupport: ["standard"],
                    permissionsPolicy: false,
                    contentSecurityPolicy: {
                        "base-uri": "'self'",
                        "default-src": "'self'",
                        "script-src": isDev
                            ? "'self' 'unsafe-inline' 'unsafe-eval'"
                            : "'self' 'unsafe-inline'",
                        "style-src": "'self' 'unsafe-inline'",
                        "img-src": "'self' data: blob:",
                        "font-src": "'self' data:",
                        "connect-src": isDev
                            ? "'self' http://10.10.10.23:8000 ws: wss: https: webpack://*"
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
