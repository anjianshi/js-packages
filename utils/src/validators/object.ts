import isPlainObject from 'lodash/isPlainObject.js'
import { success, failed } from '../lang/index.js'
import {
  getValidatorGenerator,
  type CommonOptions,
  type Validator,
  type Validated,
  type AllowedInputValue,
} from './base.js'

/** 验证有明确键值对结构的对象 */
export interface StructOptions extends CommonOptions {
  /** 定义对象结构，及各个值的验证规则 */
  struct: Record<string, Validator<unknown, CommonOptions>>
}

type StructValues<Options extends StructOptions> = {
  [Key in keyof Options['struct']]: Options['struct'][Key] extends Validator<
    infer Value,
    infer Options
  >
    ? Validated<Value, Options>
    : never
}

export function getStructValidator<const Options extends StructOptions>(options: Options) {
  return getValidatorGenerator<StructValues<Options>, Options>(
    function validate(field, value, options) {
      if (!isPlainObject(value)) return failed(`${field} should be a plain object`)

      const formatted: Record<string, unknown> = {}
      for (const [key, itemValidator] of Object.entries(options.struct)) {
        const itemResult = itemValidator(
          `${field}["${key}"]`,
          (value as Record<string, AllowedInputValue>)[key],
        )
        if (itemResult.success) {
          if (itemResult.data !== undefined) formatted[key] = itemResult.data
        } else {
          return itemResult
        }
      }
      return success(formatted as StructValues<Options>)
    },
  )(options)
}

// ---------------------------------------------------

/**
 * 验证有任意多个 key，但值的类型固定的对象
 */
export interface RecordOptions extends CommonOptions {
  /** 验证单个值  */
  record: Validator<unknown, CommonOptions>

  /** 对象至少要有几项 */
  min?: number

  /** 对象最多有几项 */
  max?: number
}

type RecordValues<Options extends RecordOptions> = Record<
  string,
  Validated<
    Options extends { record: Validator<infer T, CommonOptions> } ? T : never,
    Options extends { record: Validator<unknown, infer T> } ? T : never
  >
>

export function getRecordValidator<Options extends RecordOptions>(options: Options) {
  return getValidatorGenerator<RecordValues<Options>, Options>(
    function validate(field, value, options) {
      if (!isPlainObject(value)) return failed(`${field} should be a plain object`)

      const formatted: Record<string, unknown> = {}
      for (const [key, itemValue] of Object.entries(value as Record<string, AllowedInputValue>)) {
        // record 场景下，值为 undefined 的项目视为不存在，不保留在验证结果里，
        // 不然一些因为不想赋值而填充了 undefined 值的项目可能意外触发验证失败，或意外得到了默认值。
        // （因此 validator 的 required 选项和 defaults 选项也没有意义了）
        if (itemValue === undefined) continue

        const itemResult = options.record(`${field}["${key}"]`, itemValue)
        if (itemResult.success) {
          if (itemResult.data !== undefined) formatted[key] = itemResult.data
        } else {
          return itemResult
        }
      }

      const length = Object.keys(formatted).length
      if (typeof options.min === 'number' && length < options.min)
        return failed(`size of ${field} should >= ${options.min}`)
      if (typeof options.max === 'number' && length > options.max)
        return failed(`size of ${field} should <= ${options.max}`)

      return success(formatted as RecordValues<Options>)
    },
  )(options)
}
