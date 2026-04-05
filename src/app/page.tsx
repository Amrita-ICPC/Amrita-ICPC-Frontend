import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MoveRight } from "lucide-react";

export default async function Home() {
  const session = await auth();


  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-6">
      <div className="max-w-2xl w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Amrita ICPC Platform
        </h1>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/auth/login"
            className="group flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-full text-lg font-bold hover:scale-103 transition-all shadow-xl shadow-primary/20"
          >
            Enter
            <MoveRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
