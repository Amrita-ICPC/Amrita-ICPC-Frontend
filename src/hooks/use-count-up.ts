import { useEffect, useRef, useState } from "react";

export function useCountUp(target: number, start: boolean, duration = 1500) {
    const [value, setValue] = useState(0);
    const startedRef = useRef(false);

    useEffect(() => {
        if (!start || startedRef.current) return;
        startedRef.current = true;

        const startTime = performance.now();
        let frameId = 0;

        function step(now: number) {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(eased * target));
            if (progress < 1) frameId = requestAnimationFrame(step);
        }

        frameId = requestAnimationFrame(step);
        return () => cancelAnimationFrame(frameId);
    }, [start, target, duration]);

    return value;
}
