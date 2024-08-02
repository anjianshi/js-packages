import { success, failed } from '../lang/index.js'
import { getValidatorGenerator, type CommonOptions } from './base.js'

export type BooleanOptions = CommonOptions<boolean>

export const getBooleanValidator = getValidatorGenerator<boolean, BooleanOptions>(
  function validate(field, input) {
    let value: boolean | null = null
    if (typeof input === 'boolean') {
      value = input
    } else if (typeof input === 'string') {
      const str = input.trim().toLowerCase()
      if (['1', 'true', 'on', 'yes'].includes(str)) value = true
      else if (['0', 'false', 'off', 'no'].includes(str)) value = false
    } else if (typeof input === 'number') {
      if (input === 1) value = true
      else if (input === 0) value = false
    }
    return value === null ? failed(`${field} must be true or false`) : success(value)
  },
)
