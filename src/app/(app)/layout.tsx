import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import Sidenavbar from "@/components/global/sidenavbar";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/login");
    }

    return (
        <div className="flex min-h-screen bg-[#0b0d12] text-white">
            <Sidenavbar />
            <main className="flex-1 px-8 py-8">{children}</main>
        </div>
    );
}
