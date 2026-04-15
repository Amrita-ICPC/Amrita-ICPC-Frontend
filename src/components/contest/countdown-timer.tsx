"use client";

/**
 * Example countdown timer component using server clock sync
 * Shows how to build accurate contest countdown timers
 */

import { useEffect, useState } from "react";
import { getRemainingTime, formatTimeRemaining } from "@/lib/clock";
import { logger } from "@/lib/logger";

interface ContestCountdownProps {
    deadline: Date | number;
    onExpired?: () => void;
    className?: string;
}

export function ContestCountdown({ deadline, onExpired, className }: ContestCountdownProps) {
    const [remaining, setRemaining] = useState<string>("--:--:--");
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        // Update countdown every 100ms for smooth animation
        const interval = setInterval(() => {
            const remainingMs = getRemainingTime(deadline);

            if (remainingMs < 0) {
                if (!isExpired) {
                    setIsExpired(true);
                    logger.info({ deadline }, "Deadline passed");
                    onExpired?.();
                }
                setRemaining("Expired");
                return;
            }

            // Format as HH:MM:SS
            const totalSeconds = Math.floor(remainingMs / 1000);
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;

            const formatted = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
            setRemaining(formatted);
        }, 100);

        return () => clearInterval(interval);
    }, [deadline, isExpired, onExpired]);

    // Color based on remaining time
    let textColor = "text-green-400"; // > 1 hour
    const remainingMs = getRemainingTime(deadline);
    if (remainingMs < 60 * 1000)
        textColor = "text-red-400"; // < 1 minute
    else if (remainingMs < 5 * 60 * 1000) textColor = "text-yellow-400"; // < 5 minutes

    return (
        <div className={`font-mono text-lg font-semibold ${textColor} ${className}`}>
            {remaining}
        </div>
    );
}

/**
 * Simple text countdown display
 */
export function SimpleCountdown({
    deadline,
    className,
}: {
    deadline: Date | number;
    className?: string;
}) {
    const [text, setText] = useState<string>("Loading...");

    useEffect(() => {
        const update = () => {
            setText(formatTimeRemaining(getRemainingTime(deadline)));
        };

        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [deadline]);

    return <span className={className}>{text}</span>;
}
