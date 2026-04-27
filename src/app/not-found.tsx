import Link from "next/link";

export default function NotFound() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4 text-center">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">404</p>
                <h1 className="text-2xl font-semibold text-foreground">Page not found</h1>
                <p className="text-sm text-muted-foreground">This page does not exist.</p>
                <Link
                    href="/"
                    className="mt-2 rounded-lg bg-foreground px-5 py-2 text-sm font-medium text-background transition-opacity hover:opacity-80"
                >
                    Go home
                </Link>
            </div>
        </div>
    );
}
