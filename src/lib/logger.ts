import { Logger, ConsoleTransport, LOG_LEVEL, COLOR } from "@origranot/ts-logger";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Singleton logger instance for the application.
 * Configured with console transport and colored output.
 */
export const logger = new Logger({
    name: "Amrita ICPC",
    timestamps: true,
    transports: [
        new ConsoleTransport({
            threshold: isDev ? LOG_LEVEL.DEBUG : LOG_LEVEL.INFO,
        }),
    ],
    override: {
        logLevelColors: {
            [LOG_LEVEL.DEBUG]: COLOR.BLUE,
            [LOG_LEVEL.INFO]: COLOR.GREEN,
            [LOG_LEVEL.WARN]: COLOR.YELLOW,
            [LOG_LEVEL.ERROR]: COLOR.RED,
            [LOG_LEVEL.FATAL]: COLOR.MAGENTA,
        },
    },
});

export { LOG_LEVEL };
