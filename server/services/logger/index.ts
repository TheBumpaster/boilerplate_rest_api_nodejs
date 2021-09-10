import winston from "winston";
import {join} from "path";

/**
 * @class Logger
 * @classdesc Internal class used to manipulate with winston.Logger transports and levels based on NODE_ENV
 */
export class Logger {

    /**
     *
     * @private _service
     * @interface winston.Logger
     */
    private _service: winston.Logger;

    constructor(name: string, label?: string) {

        let level = process.env.NODE_ENV === undefined || process.env.NODE_ENV === "debug" ? "debug" : "info";

        let transports;

        if (process.env.NODE_ENV === "test") {
            level = "verbose";

            transports = [
                new winston.transports.File({
                    level,
                    filename: "testing.log",
                    dirname: join(__dirname, "../../../log"),
                    tailable: true,
                })
            ];

        } else {
            transports = [
                new winston.transports.Console({
                    level,
                })
            ];
        }



        const format = winston.format.printf(({ level, message, label, timestamp }) => {
            return `${timestamp} [${name}:${label === undefined ? "service" : label}] ${level}: ${message}`;
        });

        this._service = winston.createLogger({
            level,
            format: winston.format.combine(
                winston.format.label({label}),
                winston.format.timestamp(),
                format,
            ),
            transports,
        })
    }

    /**
     * Logs some info message
     * @param message
     */
    public info(message: string): void {
        this._service.info(message);
    }

    /**
     * Logs some warning message
     * @param message
     * @param meta
     */
    public warn(message: string, meta?: unknown[]): void {
        if (meta !== undefined) {
            this._service.warn(message, meta);
        } else {
            this._service.warn(message);
        }
    }

    /**
     * Logs an error message and it's trace in meta
     * @param message
     * @param trace
     */
    public error(message: string, trace: unknown): void {
        this._service.error(message, trace);
    }

    /**
     * Logs a debug message and it's trace in meta
     * @param message
     * @param meta
     */
    public debug(message: string, meta: unknown[]): void {
        this._service.debug(message, meta);
    }

}