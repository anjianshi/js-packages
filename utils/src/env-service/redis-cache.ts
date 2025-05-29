import { type RedisClientType } from 'redis'
import { type Logger, logger as rootLogger } from '../logging/index.js'

export function initRedisLogging(redis: RedisClientType, logger?: Logger) {
  logger ??= rootLogger.getChild('redis')
  redis.on('connect', () => logger.info('connecting'))
  redis.on('ready', () => logger.info('connected'))
  redis.on('end', () => logger.info('connection closed'))
  redis.on('reconnecting', () => logger.info('reconnecting'))
  redis.on('error', error => logger.error(error))
}

export interface CacheOptions {
  logger: Logger

  /** 数据有效期，单位秒。默认为 10 分钟。小于等于 0 代表不设有效期 */
  expires: number

  /** 读取时是否自动刷新有效期，仅设置了 expire 时有效，默认为 true */
  refreshOnRead: boolean

  /** 若为 true，读取数据后会立即将其删除，默认为 false */
  oneTime: boolean
}

/**
 * 维护缓存数据
 * 1. 每个 Cache 实例只维护一个主题的数据，且需明确定义数据类型，这样设计可明确对每一项缓存的使用、避免混乱。
 * 2. 值在存储时会 JSON 化，读取时再进行 JSON 解析（支持 JSON 化 Date 对象）。
 */
export class Cache<T> {
  readonly options: CacheOptions

  constructor(
    readonly redis: RedisClientType,
    readonly topic: string,
    options?: Partial<CacheOptions>,
  ) {
    this.options = {
      logger: rootLogger.getChild('cache'),
      expires: 600,
      refreshOnRead: true,
      oneTime: false,
      ...(options ?? {}),
    }
  }

  get logger() {
    return this.options.logger
  }

  // 经过定制的 JSON 序列化和解析方法
  protected jsonStringify(value: T) {
    // 参考：https://stackoverflow.com/a/54037861/2815178
    function replacer(this: T, key: string, value: unknown) {
      // value 是经过预处理过的值，对于 Date 对象，此时已经是 string，需要通过 this[key] 才能拿到 Date 值。
      const rawValue = this[key as keyof T] as unknown
      if (rawValue instanceof Date) return { __json_type: 'date', value: rawValue.toISOString() }
      return value
    }
    return JSON.stringify(value, replacer)
  }
  protected jsonParse(redisValue: string) {
    function reviver(key: string, value: unknown) {
      if (typeof value === 'object' && value !== null) {
        const obj = value as Record<string, unknown>
        if (obj.__json_type === 'date') return new Date(obj.value as string)
      }
      return value
    }
    return JSON.parse(redisValue, reviver) as T
  }

  protected getRedisKey(identity: string) {
    return `${this.topic}${identity ? ':' + identity : ''}`
  }

  // ----------------------------------------------

  /** 读取一项内容 */
  get(identity: string, defaults: T): Promise<T>
  get(identity?: string): Promise<T | undefined>
  async get(identity = '', defaults?: T) {
    const redisKey = this.getRedisKey(identity)
    const redisValue = await this.redis.get(redisKey)
    this.logger.debug('get', redisKey, redisValue)
    if (redisValue === null) return defaults
    if (this.options.refreshOnRead) void this.refresh(identity)

    try {
      const value = this.jsonParse(redisValue)
      if (this.options.oneTime) await this.delete(identity)
      return value
    } catch (error) {
      this.logger.error(`解析 cache 数据失败，key=${redisKey}，value=${redisValue}`, error)
      void this.delete(identity)
      return defaults
    }
  }

  /** 写入/更新一项内容 */
  set(value: T): Promise<void>
  set(identity: string, value: T): Promise<void>
  async set(identity: string | T, value?: T) {
    if (value === undefined) {
      value = identity as T
      identity = ''
    } else {
      identity = identity as string
    }

    const redisKey = this.getRedisKey(identity)
    let redisValue
    try {
      redisValue = this.jsonStringify(value)
    } catch (error) {
      this.logger.error(`格式化 cache 数据失败，key=${redisKey}`, value, error)
      throw error
    }
    this.logger.debug('set', redisKey, redisValue)
    await this.redis.set(redisKey, redisValue, { EX: this.options.expires })
  }

  /** 移除一项内容 */
  async delete(identity: string | string[] = '') {
    const identities = Array.isArray(identity) ? identity : [identity]
    this.logger.debug('delete', identities)
    return this.redis.del(identities.map(identity => this.getRedisKey(identity)))
  }

  /** 刷新一项内容的过期时间 */
  async refresh(identity = '') {
    if (this.options.expires >= 0)
      return this.redis.expire(this.getRedisKey(identity), this.options.expires)
    else return false
  }

  /** 确认一项内容是否存在  */
  async exists(identity = '') {
    return (await this.redis.exists(this.getRedisKey(identity))) === 1
  }
}
