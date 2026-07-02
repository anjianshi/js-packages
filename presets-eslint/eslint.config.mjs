import { defineConfig } from 'eslint/config'
import baseConfigs from './base/index.mjs'
// import nodeConfigs from './node/exclusive.mjs' // 因为此包没有 TypeScript 内容，所以不直接引用 node/index.cjs

export default defineConfig([
  ...baseConfigs,
  // ...nodeConfigs
])
