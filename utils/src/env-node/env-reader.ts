import * as dotenv from 'dotenv'
import { safeParseJSON } from '../lang/string.js'

/**
 * 读取 .env 文件，并获取格式化后的数据
 * 注意：依赖 dotenv 包
 */
export class EnvReader {
  envsFromFile: Record<string, string> = {}

  constructor(readonly envFiles: string | string[]) {
    dotenv.config({
      path: this.envFiles,
      processEnv: this.envsFromFile, // 把从 .env 文件读到的内容写入到此实例的属性，而不是 process.env
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
    return this.envsFromFile[key] ?? process.env[key]
  }

  get(key: string, defaults: string): string
  get(key: string, defaults: number): number
  get(key: string, defaults: boolean): boolean
  get<T extends unknown[] | Record<string, unknown>>(key: string, defaults: T): T
  get(key: string, defaults: string | number | boolean | unknown[] | Record<string, unknown>) {
    const value = this.getRaw(key)
    if (value === undefined) return defaults

    if (typeof defaults === 'number') return this.toNumber(value) ?? defaults
    else if (typeof defaults === 'boolean') return this.toBoolean(value) ?? defaults
    else if (Array.isArray(defaults) || typeof defaults === 'object')
      return safeParseJSON(value) ?? defaults

    return value
  }

  getNumber(key: string) {
    return this.toNumber(this.getRaw(key) ?? '')
  }
  getBoolean(key: string) {
    return this.toBoolean(this.getRaw(key) ?? '')
  }
  getJSON<T>(key: string) {
    return safeParseJSON<T>(this.getRaw(key) ?? '')
  }
}
