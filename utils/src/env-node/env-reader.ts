import * as dotenv from 'dotenv'
import { safeParseJSON } from '../lang/string.js'

/**
 * 读取 .env 文件，并获取格式化后的数据
 * 注意：依赖 dotenv 包
 */
export class EnvReader {
  protected loadedEnvs: Record<string, string> = {}

  constructor(envFiles?: string | string[]) {
    dotenv.config({
      path: envFiles,
      processEnv: this.loadedEnvs, // 把从 .env 文件读到的内容写入此变量，而不是 process.env，以避免污染 process.env。
    })
  }

  protected toNumber(raw: string) {
    const num = parseInt(raw, 10)
    return isFinite(num) ? num : undefined
  }
  protected toBoolean(raw: string) {
    const formatted = raw.toLowerCase().trim()
    if (['1', 'true', 'on'].includes(formatted)) return true
    if (['0', 'false', 'off'].includes(formatted)) return false
    return undefined
  }

  getRaw(key: string) {
    return this.loadedEnvs[key] ?? process.env[key]
  }

  /**
   * 获取指定 env 的值，并转换成与 defaults 匹配的类型。
   * 若值不存在，返回 defaults。
   */
  get(key: string, defaults: string): string
  get(key: string, defaults: number): number
  get(key: string, defaults: boolean): boolean
  get<T extends unknown[] | Record<string, unknown>>(key: string, defaults: T): T
  get(key: string, defaults: string | number | boolean | unknown[] | Record<string, unknown>) {
    const raw = this.getRaw(key)
    if (raw === undefined) return defaults

    if (typeof defaults === 'number') return this.toNumber(raw) ?? defaults
    else if (typeof defaults === 'boolean') return this.toBoolean(raw) ?? defaults
    else if (Array.isArray(defaults) || typeof defaults === 'object') {
      return safeParseJSON(raw) ?? defaults
    }

    return raw
  }

  /**
   * 获取指定 env 的值，并转换成指定类型，无需提供默认值。
   * 值不存在或转换失败时，返回 undefined。
   */
  getByType(key: string, type?: 'string'): string
  getByType(key: string, type: 'number'): number
  getByType(key: string, type: 'boolean'): boolean
  getByType<T extends unknown[] | Record<string, unknown>>(key: string, type: 'json'): T
  getByType(key: string, type: 'string' | 'number' | 'boolean' | 'json' = 'string') {
    const raw = this.getRaw(key)
    if (raw === undefined) return raw
    if (type === 'number') return this.toNumber(raw)
    if (type === 'boolean') return this.toBoolean(raw)
    if (type === 'json') return safeParseJSON(raw)
    return raw
  }
}
