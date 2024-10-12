import path from 'node:path'
import { getDirectoryPath } from '@anjianshi/utils/env-node/index.js'
import { EnvReader } from '@anjianshi/utils/env-service/index.js'

/**
 * 环境信息
 */
const dirpath = getDirectoryPath(import.meta.url)
export const appRoot = path.resolve(dirpath, '../../')

/**
 * 业务常量
 */
export const constants = {
  // 此处定义业务常量
}

/**
 * 设置
 * 通过 .env 文件覆盖设置
 */
const envReader = new EnvReader({
  path: [path.join(appRoot, '.env')],
})
const config = envReader.batchGet({
  // ---------- 基础设置 ----------

  // 是否开启调试模式，会影响日志记录
  DEBUG: false,

  // 监听端口
  PORT: 8000,

  // 日志文件存放路径
  LOGS_DIR: path.join(appRoot, 'logs'),

  // ---------- 服务连接 ----------

  // postgresql://[[username][:password]@][host][:port][/db-name]
  DB_URL: '',

  // redis[s]://[[username][:password]@][host][:port][/db-number]
  REDIS_URL: '',
  REDIS_KEY_PREFIX: '',
})
export default config
