import pino from 'pino'

// create pino logger
const logger = pino({
    level: "debug",
});

export default logger