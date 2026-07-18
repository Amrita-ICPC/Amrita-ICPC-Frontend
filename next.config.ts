import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    devIndicators: false,
    output: "standalone",
    turbopack: {
        root: __dirname,
    },
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
                hostname: "10.10.10.23",
                port: "8000",
                pathname: "/api/v1/images/**",
            },
            {
                protocol: "http",
                hostname: "localhost",
                port: "9000",
                pathname: "/**",
            },
            {
                protocol: "http",
                hostname: "localhost",
                port: "8000",
                pathname: "/api/v1/images/**",
            },
        ],
    },
};

export default nextConfig;
