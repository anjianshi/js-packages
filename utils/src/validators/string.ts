import { success, failed } from '../lang/index.js'
import { getValidatorGenerator, type CommonOptions } from './base.js'

export interface StringOptions extends CommonOptions<string> {
  /** 字符串最小长度。defaults='' 时默认为 0，否则默认为 1 */
  min?: number

  /** 字符串最大长度。 */
  max?: number

  /** 字符串需匹配此正则，也可传入关键词使用预置的正则。正则通常应以 ^ 和 $ 开头结尾。 */
  pattern?: RegExp | 'uuid' | 'mobile'

  /**
   * 指定一个数组或 TypeScript enum，字段值必须在此 enum 之中。
   * 若指定，前几个选项将不再生效。
   */
  choices?: string[] | Record<string, string>

  /** 验证之前，是否先清除两侧空白字符 @default true */
  trim?: boolean
}

export type StringValueWithChoices<Options extends StringOptions> = Options extends {
  choices: (infer T)[]
}
  ? T
  : Options extends { choices: Record<string, infer T> }
    ? T
    : string

export function getStringValidator<const Options extends StringOptions>(
  options: Options = {} as Options,
) {
  return getValidatorGenerator<StringValueWithChoices<Options>, Options>(
    function validate(field, value) {
      if (typeof value !== 'string') return failed(`${field} must be a string`)

      const trim = options.trim ?? true
      const formatted = trim ? value.trim() : value

      if ('choices' in options && options.choices) {
        const validValues: string[] = Array.isArray(options.choices)
          ? options.choices
          : Object.values(options.choices)
        if (!validValues.includes(formatted))
          return failed(`${field} can only be one of ${validValues.join(', ')}.`)
      } else {
        const { min = options.defaults === '' ? 0 : 1, max, pattern } = options

        if (typeof min === 'number' && formatted.length < min)
          return failed(`${field}'s length must >= ${min}`)

        if (typeof max === 'number' && formatted.length > max)
          return failed(`${field}'s length must <= ${max}`)

        if (pattern !== undefined) {
          if (pattern instanceof RegExp && !pattern.exec(formatted))
            return failed(`${field} does not match the pattern`)
          if (pattern === 'mobile' && !/^1\d{10}$/.test(formatted))
            return failed(`${field} is not a valid mobile number`)
          if (pattern === 'uuid') {
            if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(formatted))
              return failed(`${field} is not a valid uuid`)
          }
        }
      }

      return success(formatted as StringValueWithChoices<Options>)
    },
  )(options)
}
