"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { ShieldCheck, AlertCircle, Loader2, LogIn, Cpu } from "lucide-react";

/**
 * Unified Login Page
 * 
 * In Production: Redirects to Keycloak OIDC flow.
 * In Development: Provides a one-click bypass session for the active DEV_USER_ROLE.
 */
export default function LoginPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const error = searchParams.get("error");
  const [loading, setLoading] = useState(false);

  const isDev = process.env.NEXT_PUBLIC_APP_MODE === "Development";
  const devRole = process.env.NEXT_PUBLIC_DEV_USER_ROLE || "ADMIN";

  const handleLogin = async () => {
    setLoading(true);
    await signIn(isDev ? "credentials" : "keycloak", {
      callbackUrl,
      username: isDev ? "dev" : undefined,
      password: isDev ? "dev" : undefined,
    });
  };

  return (
    <div className="flex min-h-screen bg-black overflow-hidden relative font-sans text-white">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />

      <div className="m-auto w-full max-w-md p-8 relative z-10">
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 p-8 rounded-3xl shadow-2xl space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-4 animate-in zoom-in-50 duration-500">
              {isDev ? <Cpu className="w-8 h-8 text-yellow-500" /> : <ShieldCheck className="w-8 h-8 text-primary" />}
            </div>
            <h1 className="text-3xl font-bold tracking-tight leading-tight">
              {isDev ? "Dev Sandbox" : "ICPC Arena"}
            </h1>
            <p className="text-zinc-500 text-sm font-medium">
              {isDev ? `Active Role: ${devRole}` : "Authenticated Access for Amrita University"}
            </p>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>Authentication failed. Please verify your credentials.</p>
            </div>
          )}

          <div className="space-y-6">
            <button
              onClick={handleLogin}
              disabled={loading}
              className={`w-full py-4 font-bold rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:hover:scale-100 ${isDev
                ? "bg-yellow-500 text-black hover:bg-yellow-400 shadow-yellow-500/20"
                : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20"
                } hover:scale-[1.03] active:scale-[0.98]`}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isDev ? <Cpu className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                  {isDev ? `Dev Session for ROLE: ${devRole}` : "Sign In with Keycloak"}
                </>
              )}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-zinc-800"></span>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-zinc-900/50 px-3 py-1 rounded-full border border-zinc-800 text-zinc-500 font-bold tracking-widest leading-none">
                  {isDev ? "Bypass Mode Enabled" : "Authorized Access Only"}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 text-center">
            {isDev ? (
              <p className="text-yellow-500/60 text-[10px] font-bold uppercase tracking-widest">
                Testing environment for developers
              </p>
            ) : (
              <p className="text-zinc-600 text-[10px] leading-relaxed">
                By signing in, you agree to the Amrita ICPC Code of Conduct and Contest Integrity protocols.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
