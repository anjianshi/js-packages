import { success, failed } from '../lang/index.js'
import {
  getValidatorGenerator,
  type CommonOptions,
  type Validator,
  type Validated,
  type PrimitiveType,
} from './base.js'

/** 验证元素数量任意、元素类型相同的数组 */
export interface ArrayOptions extends CommonOptions {
  /** 验证数组各元素 */
  item: Validator<unknown, CommonOptions>

  /** 数组最小长度 */
  min?: number

  /** 数组最大长度 */
  max?: number

  /** 是否对数组元素进行去重 @defaults false */
  unique?: boolean

  /** 如果传入的不是数组，是否要将其视为数组内元素，包裹成数组 */
  toArray?: boolean
}

type ArrayValues<Options extends ArrayOptions> = Validated<
  Options extends { item: Validator<infer T, CommonOptions> } ? T : never,
  Options extends { item: Validator<unknown, infer T> } ? T : never
>[]

export function getArrayValidator<Options extends ArrayOptions>(options: Options) {
  return getValidatorGenerator<ArrayValues<Options>, Options>(
    function validate(field, value, options) {
      if (!Array.isArray(value)) {
        if (options.toArray) value = [value as PrimitiveType]
        else return failed(`${field} should be an array`)
      }

      let formatted = []
      if (typeof options.min === 'number' && value.length < options.min)
        return failed(`array ${field}'s length should >= ${options.min}`)

      if (typeof options.max === 'number' && value.length > options.max)
        return failed(`array ${field}'s length should <= ${options.max}`)

      const itemValidator = options.item
      for (let i = 0; i < value.length; i++) {
        const itemResult = itemValidator(`${field}[${i}]`, value[i])
        if (itemResult.success) formatted.push(itemResult.data)
        else return itemResult
      }

      if (options.unique === true) formatted = [...new Set(formatted)]

      return success(formatted as ArrayValues<Options>)
    },
  )(options)
}

// ---------------------------------------------------

/** 验证元素数量固定、类型可以不同的数组 */
export interface TupleOptions extends CommonOptions {
  /** 验证数组各元素（validator 与元素一一对应） */
  tuple: Validator<unknown, CommonOptions>[]
}

type TupleValues<Options extends TupleOptions> = {
  [Key in keyof Options['tuple']]: Options['tuple'][Key] extends Validator<
    infer Value,
    infer Options
  >
    ? Validated<Value, Options>
    : never
}

export function getTupleValidator<const Options extends TupleOptions>(options: Options) {
  return getValidatorGenerator<TupleValues<Options>, Options>(
    function validate(field, value, options) {
      if (!Array.isArray(value)) return failed(`${field} should be an array`)
      if (value.length > options.tuple.length)
        return failed(`${field} should be a tuple with ${options.tuple.length} items`)

      const formatted = []
      // 这种情况不能遍历 value，因为它的长度可能小于 opt.tuple
      for (let i = 0; i < options.tuple.length; i++) {
        const itemValidator = options.tuple[i]!
        const itemResult = itemValidator(`${field}[${i}]`, value[i])
        if (itemResult.success) formatted.push(itemResult.data)
        else return itemResult
      }
      return success(formatted as TupleValues<Options>)
    },
  )(options)
}
