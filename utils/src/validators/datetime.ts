/**
 * 验证日期时间类型的值，依赖 dayjs
 */
import dayjs, { type Dayjs } from 'dayjs'
import { success, failed } from '../lang/index.js'
import { getValidatorGenerator, type CommonOptions } from './base.js'

export interface DatetimeOptions extends CommonOptions<number> {
  dayjs?: boolean // 为 true 返回 Dayjs 对象，否则返回原生 Date 对象（默认）
}

export type DatetimeValue<Options extends DatetimeOptions> = Options extends {
  dayjs: true
}
  ? Dayjs
  : Date

export function getDatetimeValidator<const Options extends DatetimeOptions>(
  options: Options = {} as Options
) {
  return getValidatorGenerator<DatetimeValue<Options>, Options>(function validate(field, value) {
    let dayjsValue: Dayjs

    if (typeof value === 'number') {
      dayjsValue = dayjs.unix(value)
      if (!dayjsValue.isValid()) return failed(`${field} must be a valid unix timestamp`)
    } else if (typeof value === 'string') {
      dayjsValue = dayjs(value)
      if (!dayjsValue.isValid()) return failed(`${field} must be a valid datetime string`)
    } else if (value instanceof Date || dayjs.isDayjs(value)) {
      dayjsValue = dayjs(value)
      if (!dayjsValue.isValid()) return failed(`${field} must be a valid Date or Dayjs object`)
    } else {
      return failed(`${field} must be a datetime string or unix timestamp`)
    }

    return success((options.dayjs ? dayjsValue : dayjsValue.toDate()) as DatetimeValue<Options>)
  })(options)
}
