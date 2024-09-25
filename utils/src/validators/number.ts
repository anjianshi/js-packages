import { truthy, success, failed } from '../lang/index.js'
import { getValidatorGenerator, type CommonOptions } from './base.js'

export interface NumberOptions extends CommonOptions<number> {
  /** 数值最小值 */
  min?: number

  /** 数值最大值 */
  max?: number

  /** 是否允许小数 @default false */
  float?: boolean

  /**
   * 指定可选值
   * 若指定，前几个选项将不再生效 */
  choices?: number[] | Record<number, string>
}

export type NumberValueWithChoices<Options extends NumberOptions> = Options extends {
  choices: (infer T)[]
}
  ? T
  : Options extends { choices: Record<number, string> }
    ? Options['choices'][keyof Options['choices']]
    : number

export function getNumberValidator<const Options extends NumberOptions>(
  options: Options = {} as Options,
) {
  return getValidatorGenerator<NumberValueWithChoices<Options>, Options>(
    function validate(field, value) {
      if (typeof value === 'string') value = parseFloat(value)
      if (typeof value !== 'number' || !isFinite(value))
        return failed(`${field} must be a valid number`)

      if ('choices' in options && options.choices) {
        const choices = Array.isArray(options.choices)
          ? options.choices
          : Object.values(options.choices).map(v => parseInt(v, 10))
        if (!choices.includes(value))
          return failed(`${field} can only be one of ${choices.join(', ')}.`)
      } else {
        if (!truthy(options.float) && value % 1 !== 0) return failed(`${field} must be a integer`)
        if (typeof options.min === 'number' && value < options.min)
          return failed(`${field} must >= ${options.min}`)
        if (typeof options.max === 'number' && value > options.max)
          return failed(`${field} must <= ${options.max}`)
      }

      return success(value as NumberValueWithChoices<Options>)
    },
  )(options)
}
