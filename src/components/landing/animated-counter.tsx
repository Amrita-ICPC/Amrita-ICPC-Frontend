"use client";

import { useEffect, useState } from "react";

import { useCountUp } from "@/hooks/use-count-up";

interface AnimatedCounterProps {
    target: number;
    suffix?: string;
    start?: boolean;
    delay?: number;
    className?: string;
}

export function AnimatedCounter({
    target,
    suffix = "",
    start = true,
    delay = 0,
    className,
}: AnimatedCounterProps) {
    const [armed, setArmed] = useState(false);

    useEffect(() => {
        if (!start) return;
        const timeout = setTimeout(() => setArmed(true), delay);
        return () => clearTimeout(timeout);
    }, [start, delay]);

    const value = useCountUp(target, armed);

    return (
        <span className={className}>
            {value.toLocaleString()}
            {suffix}
        </span>
    );
}
