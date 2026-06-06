import "./globals.css";
import "@/lib/env";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import Provider from "@/lib/providers/provider";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Amrita ICPC",
    description: "Amrita ICPC Platform",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <Provider>{children}</Provider>
            </body>
        </html>
    );
}
