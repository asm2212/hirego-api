import { createLogger, format, transports } from "winston";

const logLevel = process.env.LOG_LEVEL || "info";

export const logger = createLogger({
  level: logLevel,
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }), // log stack trace if an error is passed
    format.colorize({ all: process.env.NODE_ENV !== "production" }),
    format.printf(({ level, message, timestamp, stack }) => {
      return stack
        ? `[${timestamp}] ${level}: ${message}\n${stack}`
        : `[${timestamp}] ${level}: ${message}`;
    })
  ),
  transports: [new transports.Console()],
});