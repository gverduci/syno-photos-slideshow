import pino from 'pino'
import "client-only"

// create pino logger
const logger = pino({
    browser: {
      transmit: {
        level: 'warn',
        send: function (level, logEvent) {
          console.log(logEvent);
          fetch(`/api/logger/${level}`,{
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(logEvent)
          })
        }
      }
    }
})

export default logger