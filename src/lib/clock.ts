let serverDelta = 0;
let isSynchronized = false;

export async function synchronizeClock(healthEndpointUrl: string): Promise<void> {
    try {
        const fetchStart = Date.now();
        const response = await fetch(healthEndpointUrl, { cache: "no-store", method: "GET" });
        if (!response.ok) {
            throw new Error(`Failed to fetch server time: ${response.statusText}`);
        }
        
        const fetchEnd = Date.now();
        const latency = (fetchEnd - fetchStart) / 2;
        
        const data = await response.json();
        // Assuming the backend returns the current IST timestamp in milliseconds as `timestamp`
        const serverTimestamp = typeof data.timestamp === 'number' ? data.timestamp : Date.now(); 
        
        // serverDelta = (Server Time + Latency) - Local Time
        serverDelta = (serverTimestamp + latency) - Date.now();
        isSynchronized = true;
        console.log(`[Clock] Synchronized with server. Delta: ${serverDelta}ms`);
    } catch (error) {
        console.error("[Clock] Synchronization failed", error);
        // Fallback or retry logic can be implemented here
    }
}

export function getServerTime(): number {
    return Date.now() + serverDelta;
}

export function getIsSynchronized(): boolean {
    return isSynchronized;
}
