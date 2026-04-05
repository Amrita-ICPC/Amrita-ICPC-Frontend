export default function AccessDenied() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
            <h2 className="text-2xl font-bold text-destructive mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You do not have the required permissions to view this content.</p>
        </div>
    );
}
