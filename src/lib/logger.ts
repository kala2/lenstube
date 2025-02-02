import { log } from 'next-axiom'

const logger = {
  log: (message: string, info: any) => {
    console.log(message, info)
    log.info(message, info)
  },
  warn: (...args: any) => {
    console.warn(...args)
  },
  error: (message: string, error: any) => {
    console.error(message, error)
    log.error(message, error)
  }
}

export default logger
