import { createWriteStream, mkdirSync } from 'fs'
import { join } from 'path'
import pino from 'pino'
import { logger } from '@/features/lib/logger'

export function register() {
  const logDir = join(process.cwd(), 'logs')
  mkdirSync(logDir, { recursive: true })

  const fileStream = createWriteStream(join(logDir, 'app.log'), { flags: 'a' })
  const pinoLogger = pino({ level: 'debug' }, fileStream)

  logger.addReporter({
    log(logObj) {
      const { level, args, date } = logObj
      const pinoLevel =
        level <= 0 ? 'fatal'
        : level === 1 ? 'error'
        : level === 2 ? 'warn'
        : level === 3 ? 'info'
        : 'debug'

      const [first, ...rest] = args
      const msg = typeof first === 'string' ? first : JSON.stringify(first)
      const extra = rest.length === 1 && typeof rest[0] === 'object' ? rest[0] : { extra: rest }

      pinoLogger[pinoLevel]({ ...extra, time: date?.toISOString() }, msg)
    },
  })
}
