// [检验环境] 普通 JavaScript 文件
// [检验内容] ESLint 基础功能、文件引用

// lib.js 应能正常引用
// libValue 应能正常引用
// libValue2 应报错：变量不存在
import { libValue, libValue2 } from './lib.js'

// lib2 应报错，因为没有带上扩展名（Node.js ESM 解析要求必须带上扩展名）
import { libValueFromLib2 } from './lib2'

// other-lib.js 应报错：文件不存在
import { libValue3 } from './other-lib.js'

// 不应报错
export const valuesFromLib = [libValue, libValue2, libValueFromLib2, libValue3]

// 不应报错
const v1 = 1

// v2 应报错：变量未被使用
// v3 应报错：变量不存在
const v2 = v1 + v3
