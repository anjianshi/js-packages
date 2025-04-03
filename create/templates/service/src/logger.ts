import { logger as rootLogger } from '@anjianshi/utils/env-node/logging/index.js'
import { Logger, initLogger } from 'starlight-server'
import config from '@/config.js'

export { Logger, rootLogger }

initLogger(rootLogger, {
  level: config.DEBUG ? 'debug' : 'info',
  debugLib: '*',
  file: { dir: config.LOGS_DIR },
})
