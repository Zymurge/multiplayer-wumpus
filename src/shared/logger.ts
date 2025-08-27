import * as winston from 'winston';

// Define the custom log levels interface
interface LogLevels {
  error: number;
  warn: number;
  info: number;
  debug: number;
  [key: string]: number;
}

// Define your custom log levels
const levels: LogLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

// Set up the logger
export const logger = winston.createLogger({
  levels,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.simple()
  ),
  transports: [
    // Console transport for both components
    new winston.transports.Console({
      level: process.env.LOG_LEVEL || 'info', // Use an env variable to set the level
    }),
    // File transport for the server component only
    new winston.transports.File({
      filename: 'combined.log',
      level: 'debug',
    }),
  ],
});