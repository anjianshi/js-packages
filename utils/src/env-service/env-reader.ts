import * as dotenv from 'dotenv'
import { safeParseJSON } from '../lang/string.js'

type EnvValue = string | number | boolean | unknown[] | Record<string, unknown>

type TypeDef = 'string' | 'number' | 'boolean' | unknown[] | Record<string, unknown>
type TypeFrom<D extends TypeDef> = D extends 'string'
  ? string
  : D extends 'number'
    ? number
    : D extends 'boolean'
      ? boolean
      : D
type ResultFrom<Defs extends Record<string, TypeDef>> = {
  [K in keyof Defs]: TypeFrom<Defs[K]>
}

/**
 * 读取 .env 文件，并获取格式化后的数据
 * 注意：依赖 dotenv 包
 */
export class EnvReader {
  protected loadedEnvs: Record<string, string> = {}

  constructor(options: dotenv.DotenvConfigOptions = {}) {
    dotenv.config({
      ...options,

      // 把从 .env 文件读到的内容写入此变量，而不是 process.env，以避免污染 process.env。
      processEnv: this.loadedEnvs,
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
  get(key: string, defaults: EnvValue) {
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
  getByType(key: string, type?: 'string'): string | undefined
  getByType(key: string, type: 'number'): number | undefined
  getByType(key: string, type: 'boolean'): boolean | undefined
  getByType<T extends unknown[] | Record<string, unknown>>(key: string, type: 'json'): T | undefined
  getByType(key: string, type: 'string' | 'number' | 'boolean' | 'json' = 'string') {
    const raw = this.getRaw(key)
    if (raw === undefined) return raw
    if (type === 'number') return this.toNumber(raw)
    if (type === 'boolean') return this.toBoolean(raw)
    if (type === 'json') return safeParseJSON(raw)
    return raw
  }

  /**
   * 同 envReader.get()，只不过是通过对象指定各 env 的默认值来批量获取
   * envReader.batchGet({ port: 8000, debug: false, mobiles: ['123', '456'] }
   */
  batchGet<Defs extends Record<string, EnvValue>>(definitions: Defs) {
    const result = {} as Record<string, unknown>
    for (const [key, defaults] of Object.entries(definitions)) {
      result[key] = this.get(key, defaults as string)
    }

    // 保证返回的值类型是“通用化”的，例如不是 `false` 而是 `boolean`
    return result as {
      [K in keyof Defs]: Defs[K] extends string
        ? string
        : Defs[K] extends number
          ? number
          : Defs[K] extends boolean
            ? boolean
            : Defs[K]
    }
  }

  /**
   * 同 envReader.getByType()，只不过是通过对象指定各 env 的类型来批量获取。
   *
   * - required=false（默认）时，不存在或值为 undefined 的 env 不会出现在返回对象里，以保证 { ...defaults, ...envReader.batchGetByType(...) } 的用法能正常保留默认值。
   * - required=true 时要求所有 env 都必须有值，否则会抛出异常
   *
   * envReader.batchGetByType({
   *   port: 'number',
   *   debug: 'boolean',
   *   mobiles: [] as string[],  // 用此格式定义内容是数组的 JSON 值
   *   obj: {} as { a: number, b: string } // 用此格式定义内容是对象的 JSON 值
   * })
   */
  batchGetByType<Defs extends Record<string, TypeDef>>(
    definitions: Defs,
    required?: false,
  ): Partial<ResultFrom<Defs>>
  batchGetByType<Defs extends Record<string, TypeDef>>(
    definitions: Defs,
    required: true,
  ): ResultFrom<Defs>
  batchGetByType<Defs extends Record<string, TypeDef>>(definitions: Defs, required = false) {
    const result = {} as Record<string, unknown>
    for (const [key, def] of Object.entries(definitions)) {
      const value =
        typeof def === 'string' ? this.getByType(key, def as 'string') : this.getByType(key, 'json')
      if (value !== undefined) result[key] = value
      else if (required) throw new Error(`env ${key} needs a value`)
    }
    return result
  }
}
