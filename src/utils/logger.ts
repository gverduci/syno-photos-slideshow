import pino from 'pino'
import "server-only"

// create pino logger
const logger = pino({
    level: "debug",
    formatters: {
        level: (label) => {
            return { level: label.toUpperCase() };
        },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    base: null
})

export default logger