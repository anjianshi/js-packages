/**
 * 类似 lang/random.ts，但基于 Node.js 的 crypto 模块，提供密码级的随机数。
 */
import crypto from 'node:crypto'

/**
 * 返回随机数，包含 min 和 max
 */
export function getRandomInt(min: number, max: number) {
  return crypto.randomInt(min, max + 1)
}

/**
 * 返回随机字符串
 */
export function getRandomString(length = 6, seed = '0123456789abcdefghijklmnopqrstuvwxyz') {
  let result = ''
  while (result.length < length) result += seed[getRandomInt(0, seed.length - 1)]
  return result
}

/**
 * 从给定的选择中随机选中一项
 */
export function choiceRandom<T>(choices: T[]) {
  return choices[getRandomInt(0, choices.length - 1)]!
}
