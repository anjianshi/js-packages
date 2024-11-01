/**
 * 实现创建 validator 的快捷方式
 */
import {
  type ArrayOptions,
  getArrayValidator,
  type TupleOptions,
  getTupleValidator,
} from './array.js'
import { type Validator, type CommonOptions, type Validated, getAnyValidator } from './base.js'
import { type BooleanOptions, getBooleanValidator } from './boolean.js'
import { type NumberOptions, type NumberValueWithChoices, getNumberValidator } from './number.js'
import {
  type RecordOptions,
  getRecordValidator,
  type StructOptions,
  getStructValidator,
} from './object.js'
import { type StringOptions, type StringValueWithChoices, getStringValidator } from './string.js'

export interface AnyDefinition extends CommonOptions {
  type: 'any'
}
export interface BooleanDefinition extends BooleanOptions {
  type: 'boolean'
}
export interface NumberDefinition extends NumberOptions {
  type: 'number'
}
export interface StringDefinition extends StringOptions {
  type: 'string'
}
export interface ArrayDefinition extends Omit<ArrayOptions, 'item'> {
  type: 'array'
  item: Definition
}
export interface TupleDefinition extends Omit<TupleOptions, 'tuple'> {
  type: 'tuple'
  tuple: Definition[]
}
export interface StructDefinition extends Omit<StructOptions, 'struct'> {
  type: 'struct'
  struct: Record<string, Definition>
}
export interface RecordDefinition extends Omit<RecordOptions, 'record'> {
  type: 'record'
  record: Definition
}

export type Definition =
  | AnyDefinition
  | BooleanDefinition
  | NumberDefinition
  | StringDefinition
  | ArrayDefinition
  | TupleDefinition
  | StructDefinition
  | RecordDefinition

export type ValueOfDefinition<Def extends Definition> = Def extends AnyDefinition
  ? unknown
  : Def extends BooleanDefinition
    ? boolean
    : Def extends NumberDefinition
      ? NumberValueWithChoices<Def>
      : Def extends StringDefinition
        ? StringValueWithChoices<Def>
        : Def extends ArrayDefinition
          ? Validated<ValueOfDefinition<Def['item']>, Def['item']>[]
          : Def extends TupleDefinition
            ? {
                [Key in keyof Def['tuple']]: Def['tuple'][Key] extends Definition
                  ? Validated<ValueOfDefinition<Def['tuple'][Key]>, Def['tuple'][Key]>
                  : Def['tuple'][Key]
              }
            : Def extends StructDefinition
              ? {
                  [Key in keyof Def['struct']]: Validated<
                    ValueOfDefinition<Def['struct'][Key]>,
                    Def['struct'][Key]
                  >
                }
              : Def extends RecordDefinition
                ? Record<string, Validated<ValueOfDefinition<Def['record']>, Def['record']>>
                : never

export type OptionsFromDefinition<Def extends Definition> = Def extends ArrayDefinition
  ? Omit<Def, 'item'> & { item: ValidatorForDefinition<Def['item']> }
  : Def extends TupleDefinition
    ? Omit<Def, 'tuple'> & {
        tuple: {
          [Key in keyof Def['tuple']]: Def['tuple'][Key] extends Definition
            ? ValidatorForDefinition<Def['tuple'][Key]>
            : never
        }
      }
    : Def extends StructDefinition
      ? Omit<Def, 'struct'> & {
          struct: { [Key in keyof Def['struct']]: ValidatorForDefinition<Def['struct'][Key]> }
        }
      : Def extends RecordDefinition
        ? Omit<Def, 'record'> & { record: ValidatorForDefinition<Def['record']> }
        : Def

export type ValidatorForDefinition<Def extends Definition> = Validator<
  ValueOfDefinition<Def>,
  OptionsFromDefinition<Def>
>

export type ResultForDefinition<Def extends Definition> = ReturnType<ValidatorForDefinition<Def>>

export function getValidator<const InputDefinition extends Definition>(
  definition: InputDefinition,
): ValidatorForDefinition<InputDefinition> {
  type GotValidator = ValidatorForDefinition<InputDefinition>
  switch (definition.type) {
    case 'any':
      return getAnyValidator(definition) as GotValidator
    case 'boolean':
      return getBooleanValidator(definition) as GotValidator
    case 'number':
      return getNumberValidator(definition) as GotValidator
    case 'string':
      return getStringValidator(definition) as GotValidator
    case 'array':
      // @ts-ignore 允许递归类型推断
      return getArrayValidator({
        // @ts-ignore 允许递归类型推断
        ...definition,
        item: getValidator(definition.item),
      }) as GotValidator
    case 'tuple':
      return getTupleValidator({
        ...definition,
        tuple: definition.tuple.map(def => getValidator(def)),
      }) as GotValidator
    case 'struct': {
      const struct: Record<string, Validator<unknown, CommonOptions>> = {}
      for (const [key, def] of Object.entries(definition.struct)) struct[key] = getValidator(def)
      return getStructValidator({ ...definition, struct }) as GotValidator
    }
    case 'record':
      return getRecordValidator({
        ...definition,
        record: getValidator(definition.record),
      }) as GotValidator
  }
}

// ---------------- 测试用例 -----------------

// const v1 = getValidator({ type: 'string' })(1)
// const v2 = getValidator({ type: 'string', null: true })(1)
// const v3 = getValidator({ type: 'string', null: true, required: false })(1)
// const v4 = getValidator({ type: 'string', null: true, required: false, choices: ['a', 'b', 'c'] })(
//   1,
// )
// const v5 = getValidator({
//   type: 'string',
//   null: true,
//   required: false,
//   choices: ['a', 'b', 'c'],
//   defaults: 'd',
// })(1)
// const v6 = getValidator({
//   type: 'array',
//   null: true,
//   required: false,
//   item: { type: 'string', null: true, choices: ['a', 'b', 'c'] },
// })(1)
// const v7 = getValidator({
//   type: 'tuple',
//   tuple: [
//     { type: 'string', choices: ['a', 'b', 'c'] },
//     { type: 'string', null: true },
//   ],
// })(1)
// if (v7.success) {
//   const [a, b] = v7.data
// }
// const v8 = getValidator({
//   type: 'struct',
//   struct: {
//     x: { type: 'string', choices: ['a', 'b', 'c'] },
//     y: { type: 'string', null: true },
//   },
// })(1)
// if (v8.success) {
//   const { x, y } = v8.data
// }
// const v9 = getValidator({
//   type: 'record',
//   record: { type: 'string', null: true, choices: ['a', 'b', 'c'] },
// })(1)
