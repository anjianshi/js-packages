/**
 * 计算颜色数值
 */

/**
 * hex 颜色字符串转换为 rgba 数值
 * 例如 '#22334455' => [34,51,68,0.33]
 *
 * hex 字符串支持以下格式：
 * - 带/不带开头的 #
 * - #RGB
 * - #RGBA
 * - #RRGGBB
 * - #RRGGBBAA
 */
export function hex2rgba(rawHex: string) {
  let hex = rawHex
  if (hex.startsWith('#')) hex = hex.slice(1) // 去掉开头的 #
  if (hex.length === 3) hex = `${hex[0]!}${hex[0]!}${hex[1]!}${hex[1]!}${hex[2]!}${hex[2]!}FF`
  if (hex.length === 4)
    hex = `${hex[0]!}${hex[0]!}${hex[1]!}${hex[1]!}${hex[2]!}${hex[2]!}${hex[3]!}${hex[3]!}`
  if (hex.length === 6) hex = `${hex}FF`
  if (hex.length !== 8) throw new Error(`不支持的颜色值：${rawHex}`)
  hex = hex.toUpperCase() // 转成全大写

  const [r, g, b, a255] = [hex.slice(0, 2), hex.slice(2, 4), hex.slice(4, 6), hex.slice(6)].map(
    part => parseInt(part, 16)
  ) as [number, number, number, number]
  const a = Math.round((a255 / 255) * 100) / 100

  return [r, g, b, a] as const
}

/**
 * 把 rgba 数组转换为 hex 颜色字符串
 * 如果 alpha 部分为 1，会将其省略
 * [34,51,68,0.33] => '#22334455'
 */
export function rgba2hex(rgba: [number, number, number, number]) {
  const withAlpha = rgba[3] !== 1
  return (
    '#' +
    [
      rgba[0].toString(16),
      rgba[1].toString(16),
      rgba[2].toString(16),
      ...(withAlpha ? [Math.round(rgba[3] * 255).toString(16)] : []),
    ]
      .map(v => (v.length === 1 ? `0${v}` : v))
      .join('')
  )
}

/**
 * rgb 转成 hsl 值（以便计算亮度）
 * https://www.rapidtables.com/convert/color/rgb-to-hsl.html
 */
export function rgb2hsl([r, g, b]: [number, number, number]) {
  const [r1, g1, b1] = [r, g, b].map(v => v / 255) as [number, number, number]
  const cMax = Math.max(r1, g1, b1)
  const cMin = Math.min(r1, g1, b1)
  const delta = cMax - cMin

  let h: number
  if (delta === 0) h = 0
  else if (cMax === r1) h = 60 * (((g1 - b1) / delta) % 6)
  else if (cMax === g1) h = 60 * ((b1 - r1) / delta + 2)
  else h = 60 * ((r1 - g1) / delta + 4)
  if (h < 0) h = 360 + h
  const roundH = Math.round(h)

  const l = (cMax + cMin) / 2
  const roundL = Math.round(l * 100) / 100

  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1))
  const roundS = Math.round(s * 100) / 100

  return [roundH, roundS, roundL] as const
}

/**
 * hsl 转成 rgb
 * https://www.rapidtables.com/convert/color/hsl-to-rgb.html
 */
export function hsl2rgb([h, s, l]: [number, number, number]) {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2

  const [r1, g1, b1] = (() => {
    if (h < 60) return [c, x, 0]
    if (h < 120) return [x, c, 0]
    if (h < 180) return [0, c, x]
    if (h < 240) return [0, x, c]
    if (h < 300) return [x, 0, c]
    return [c, 0, x]
  })()

  const [r, g, b] = [r1 + m, g1 + m, b1 + m].map(v => Math.round(v * 255)) as [
    number,
    number,
    number
  ]

  return [r, g, b] as const
}

/**
 * 调整颜色深浅
 * lightness('#111', 0.2)  => lighten(20%)
 * lightness('#111', -0.5)  => darken(50%)
 */
export function lightness(hex: string, ratio: number) {
  const [r, g, b, a] = hex2rgba(hex)
  const [h, s, l] = rgb2hsl([r, g, b])
  const l1 = Math.max(0, Math.min(1, l + ratio))
  const [r1, g1, b1] = hsl2rgb([h, s, l1])
  return rgba2hex([r1, g1, b1, a])
}
