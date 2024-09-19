/**
 * 返回随机数，包含 min 和 max
 */
export function getRandomInt(min: number, max: number) {
  const minCeiled = Math.ceil(min)
  const maxFloored = Math.floor(max)
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled)
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
 * 如果数组为空，会返回 undefined
 */
export function choiceRandom<T>(choices: T[]) {
  return choices[getRandomInt(0, choices.length - 1)]
}
