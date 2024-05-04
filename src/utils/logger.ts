import pino from 'pino'
import "server-only"

// create pino logger
const logger = pino({
    level: "debug",
})

export default logger