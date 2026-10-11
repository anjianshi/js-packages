/**
 * 时间处理相关函数
 */

/**
 * 返回指定天数对应的毫秒数
 */
export function daysMS(n: number) {
  return hoursMS(n * 24)
}

/**
 * 返回指定小时数对应的毫秒数
 */
export function hoursMS(n: number) {
  return minutesMS(n * 60)
}

/**
 * 返回指定分钟数对应的毫秒数
 */
export function minutesMS(n: number) {
  return secondsMS(n * 60)
}

/**
 * 返回指定秒数对应的毫秒数
 */
export function secondsMS(n: number) {
  return n * 1000
}
