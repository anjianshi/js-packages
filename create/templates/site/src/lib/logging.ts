import { ConsoleHandler } from '@anjianshi/utils/env-browser/logging.js'
import { logger, LogLevel } from '@anjianshi/utils/logging/index.js'
import { config } from '@/lib/config.js'

logger.setLevel(config.inDev ? LogLevel.Debug : LogLevel.Info)
logger.addHandler(new ConsoleHandler())
export { logger }

export function getLogger(name: string) {
  return logger.getChild(name)
}
