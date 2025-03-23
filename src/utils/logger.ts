import pino, { Logger } from 'pino'
import "server-only"
import { AppConfig } from './config';

// create pino logger
let logger: Logger | undefined = undefined;

const getLogger = (config?: AppConfig | undefined): Logger => {
    if (logger) {
        return logger
    }
    logger = pino({
        level: config ? config.logger.level || 'debug' : 'debug',
        formatters: {
            level: (label) => {
                return { level: label.toUpperCase() };
            },
        },
        timestamp: pino.stdTimeFunctions.isoTime,
        base: null
    })
    return logger;

}

export default getLogger