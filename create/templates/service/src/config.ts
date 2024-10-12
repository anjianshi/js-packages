import path from 'node:path'
import { getDirectoryPath } from '@anjianshi/utils/env-node/index.js'
import { EnvReader } from '@anjianshi/utils/env-service/index.js'

/**
 * 环境信息
 */
const dirpath = getDirectoryPath(import.meta.url)
export const projectRoot = path.resolve(dirpath, '../../')
export const appRoot = path.resolve(dirpath, '../')

/**
 * 业务常量
 */
export const constants = {
  // 此处定义业务常量
}

/**
 * 设置
 * 定义在 .env 文件中，可通过 .env.local 文件覆盖
 */
const envReader = new EnvReader({
  path: [
    path.join(projectRoot, '.env.local'),
    path.join(projectRoot, '.env'),
    path.join(appRoot, '.env.local'),
    path.join(appRoot, '.env'),
  ],
})
const config = envReader.batchGet({
  DEBUG: false,
  PORT: 8000,
  LOGS_DIR: path.join(appRoot, 'logs'),

  DB_URL: '',
  REDIS_URL: '',
  REDIS_KEY_PREFIX: '',
})
export default config
