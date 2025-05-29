import path from 'node:path'
import { getDirectoryPath } from '@anjianshi/utils/env-node/index.js'
import { EnvReader } from '@anjianshi/utils/env-service/index.js'

/**
 * 环境信息
 */
const dirpath = getDirectoryPath(import.meta.url)
export const appRoot = path.resolve(dirpath, '../')

/**
 * 设置
 * 通过 .env 文件覆盖设置
 */
const envReader = new EnvReader({
  path: [path.join(appRoot, '.env')],
})
const config = envReader.batchGet({
  // 是否开启调试模式，会影响日志记录
  DEBUG: false,

  // postgresql://[[username][:password]@][host][:port][/db-name]
  DB_URL: '',

  // redis[s]://[[username][:password]@][host][:port][/db-number]
  REDIS_URL: '',
  REDIS_KEY_PREFIX: 'test:',
})
export default config
