import { success, failed, type MaySuccess } from '../lang/index.js'

/**
 * 支持传入进行验证的值类型
 */
export type AllowedInputValue = PrimitiveType | null | undefined

/**
 * JavaScript 基础值类型
 */
export type PrimitiveType =
  | string
  | boolean
  | number
  | PrimitiveType[]
  | [...PrimitiveType[]]
  | { [key: string]: PrimitiveType }

/**
 * validator 通用参数
 */
export interface CommonOptions<Defaults = unknown> {
  /** 是否允许 null 值 @default false */
  null?: boolean

  /** 字段是否必须有值（不能是 undefined） @default true */
  required?: boolean

  /**
   * 默认值，字段无值（或值为 undefined）时生效，值为 null 不会生效。
   * 指定后 required 选项将失去作用。
   */
  defaults?: Defaults
}

/**
 * 补全了的 Options
 */
type FullfiledOptions<Options extends Partial<CommonOptions>> = Omit<
  Options,
  keyof CommonOptions
> & {
  null: Options['null'] extends true ? true : false
  required: Options['required'] extends false ? false : true
  defaults: Options extends { defaults: infer T } ? T : undefined
}

/**
 * 验证完成后能得到的值类型
 */
export type Validated<Value, InputOptions extends CommonOptions> =
  FullfiledOptions<InputOptions> extends { defaults: undefined }
    ? FullfiledOptions<InputOptions> extends { required: false; null: false }
      ? Value | undefined
      : FullfiledOptions<InputOptions> extends { required: false; null: true }
        ? Value | undefined | null
        : FullfiledOptions<InputOptions> extends { required: true; null: false }
          ? Value
          : FullfiledOptions<InputOptions> extends { required: true; null: true }
            ? Value | null
            : Value
    : FullfiledOptions<InputOptions> extends {
          defaults: infer T
          null: false
        }
      ? Value | T
      : FullfiledOptions<InputOptions> extends { defaults: infer T; null: true }
        ? Value | T | null
        : never

/**
 * 最终生成的 validator 函数类型
 */
export interface Validator<Value, InputOptions extends CommonOptions> {
  (input: AllowedInputValue): MaySuccess<Validated<Value, InputOptions>>
  (field: string, input: AllowedInputValue): MaySuccess<Validated<Value, InputOptions>>
}

// -----------------------------------

/**
 * 返回支持指定格式的 options、并按照传入的逻辑进行验证的 validator 的生成器。
 * 对 CommonOptions 相关内容的验证以自动包含在里面，只需要传入额外的验证逻辑即可。
 */
export function getValidatorGenerator<Value, Options extends CommonOptions>(
  validate: (
    field: string,
    input: PrimitiveType | Validated<Value, Options>,
    options: Options,
  ) => MaySuccess<Value>,
) {
  return function validatorGenerator<const InputOptions extends Options>(
    inputOptions: InputOptions,
  ): Validator<Value, InputOptions> {
    type Return = MaySuccess<Validated<Value, InputOptions>>
    function validator(input: AllowedInputValue): Return
    function validator(field: string, input: AllowedInputValue): Return
    function validator(field: string | AllowedInputValue, input?: AllowedInputValue) {
      const { null: allowNull = false, required = true, defaults } = inputOptions

      if (typeof field !== 'string') {
        input = field
        field = 'value'
      }

      let value: AllowedInputValue | Validated<Value, Options> = input
      if (typeof value === 'undefined') {
        if (typeof defaults !== 'undefined') {
          value = defaults as Validated<Value, Options>
        } else if (required) {
          return failed(`${field} is required`)
        }
      }
      if (value === null && !allowNull) return failed(`${field} cannot be null`)
      if (value === null || value === undefined) return success(value)

      return validate(field, value, inputOptions)
    }
    return validator
  }
}

// -----------------------------------

/**
 * 返回只进行基本检查，不带定制的验证逻辑的 validator。
 * 同时也是定制 validator 最小化实现的例子。
 */
export const getAnyValidator = getValidatorGenerator<unknown, CommonOptions>(
  function validate(field, input) {
    return success(input)
  },
)
