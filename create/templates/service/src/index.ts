import { startHTTPServer } from 'starlight-server'
import { initRedis } from '@/cache.js'
import config from '@/config.js'
import { rootLogger } from '@/logger.js'
import { router } from '@/routes/index.js'

import './tasks/index.js'

await initRedis()

startHTTPServer({
  handler: router.handle,
  logger: rootLogger.getChild('http'),
  port: config.PORT,
})
