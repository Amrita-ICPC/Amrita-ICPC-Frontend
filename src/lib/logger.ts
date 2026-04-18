/**
 * Log levels for the application.
 */
export enum LOG_LEVEL {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    FATAL = 4,
}

const isDev = process.env.NODE_ENV !== "production";

/**
 * Browser-safe singleton logger instance for the application.
 */
class SimpleLogger {
    private name: string;

    constructor(name: string) {
        this.name = name;
    }

    private format(level: string, message: string) {
        const timestamp = new Date().toISOString();
        return `[${timestamp}] [${this.name}] [${level}] ${message}`;
    }

    debug(message: string, ...args: unknown[]) {
        if (isDev) console.debug(this.format("DEBUG", message), ...args);
    }

    info(message: string, ...args: unknown[]) {
        console.info(this.format("INFO", message), ...args);
    }

    warn(message: string, ...args: unknown[]) {
        console.warn(this.format("WARN", message), ...args);
    }

    error(message: string, ...args: unknown[]) {
        console.error(this.format("ERROR", message), ...args);
    }

    fatal(message: string, ...args: unknown[]) {
        console.error(this.format("FATAL", message), ...args);
    }
}

export const logger = new SimpleLogger("Amrita ICPC");
