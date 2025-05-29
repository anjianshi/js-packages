import { logger as rootLogger, adaptDebugLib } from '@anjianshi/utils/env-node/logging/index.js'
import config from '@/utils/lib/config.js'
import debug from 'debug'

export { rootLogger }

rootLogger.setLevel(config.DEBUG ? 'debug' : 'info')
adaptDebugLib(debug, '*', rootLogger)
