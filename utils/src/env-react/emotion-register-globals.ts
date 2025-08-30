/**
 * 把 emotion 的 css 函数注册为全局变量，就不用每次使用都手动引入了
 */
import { css as cssValue } from '@emotion/react'

declare global {
  var css: typeof cssValue
}

globalThis.css = cssValue
