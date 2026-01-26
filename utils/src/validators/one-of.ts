import { failed, type Result } from '../lang/index.js'
import {
  getValidatorGenerator,
  type CommonOptions,
  type Validator,
  type AllowedInputValue,
} from './base.js'

/** 要求返回值通过其中一个验证器的检查 */
export interface OneOfOptions extends CommonOptions {
  /** 验证数组各元素 */
  validators: Validator<unknown, CommonOptions>[]
}

export type OneOfValue<Options extends OneOfOptions> = Options extends {
  validators: Validator<infer T, CommonOptions>[]
}
  ? T
  : never

export function getOneOfValidator<const Options extends OneOfOptions>(
  options: Options = {} as Options,
) {
  return getValidatorGenerator<OneOfValue<Options>, Options>(function validate(field, value) {
    const errors: string[] = []
    for (const validator of options.validators) {
      const result = validator(field, value as AllowedInputValue)
      if (result.success) return result as Result<OneOfValue<Options>>
      else errors.push(result.message)
    }
    return failed(`${field} do not match any valid format：\n- ` + errors.join('\n- '))
  })(options)
}
