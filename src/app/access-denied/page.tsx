import AccessDenied from "@/components/auth/access-denied";

/**
 * Access Denied Page
 * 
 * Publicly accessible route that renders the AccessDenied component.
 * Used for redirecting users who lack required permissions.
 */
export default function AccessDeniedPage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
            <AccessDenied />
        </main>
    );
}
