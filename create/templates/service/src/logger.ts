import { Logger, getLogger } from 'starlight-server'
import config from '@/config.js'

export { Logger }

export const rootLogger = getLogger({
  level: config.DEBUG ? 'debug' : 'info',
  debugLib: '*',
  file: { dir: config.LOGS_DIR },
})
