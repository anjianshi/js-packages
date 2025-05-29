// [检验环境] Node.js + TypeScript
// [检验内容] ESLint 基础功能、文件引用、TypeScript 的类型检查

// lib-a.js 应能正常引用
// functionA1 应能正常引用
// functionA2 应报错：变量不存在
import { functionA1, functionA2 } from '@/eslint/node/lib-a.js'

// lib-b.js 应能正常引用
// functionB1 应能正常引用
// functionB2 应报错：变量不存在
import { functionB1, functionB2 } from './lib-b.js'

// ./lib-c.js 和 @/eslint/node/lib-c.js 应报错：文件不存在
import { functionC1 } from './lib-c.js'
import { functionC2 } from '@/eslint/node/lib-c.js'

// functionA1 和 functionB1 应能正常调用
// 其他函数调用应报错：不是可安全调用的类型
console.log(functionA1(), functionA2(), functionB1(), functionB2(), functionC1(), functionC2())

// process.argv 应能正常引用且有类型定义
// argv 应报错：变量未被使用
const argv = process.argv
