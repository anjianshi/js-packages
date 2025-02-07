/**
 * 维护基于 redis 的数据缓存
 */
import { type CacheOptions, Cache, initRedisLogging } from '@anjianshi/utils/env-service/index.js'
import { createClient, type RedisClientType } from 'redis'
import config from '@/config.js'
import { rootLogger } from '@/logger.js'

export const redis: RedisClientType = createClient({
  url: config.REDIS_URL,
  disableOfflineQueue: true, // 若在 Redis 连接断开时执行命令，立刻失败，而不是等待重新连接
})

export async function initRedis() {
  initRedisLogging(redis)
  await redis.connect()
}

/**
 * 生成管理某项缓存的实例
 * 使用规范见 README.md 里的“缓存使用流程”
 */
export function getCacheInstance<T>(topic: string, options?: Partial<CacheOptions>) {
  return new Cache<T>(redis, config.REDIS_KEY_PREFIX + topic, {
    logger: rootLogger.getChild('cache'),
    ...(options ?? {}),
  })
}
