import { defineConfig } from 'eslint/config'
import eslintConfigPrettier from 'eslint-config-prettier'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import tsReactHooksPlugin from 'eslint-plugin-ts-react-hooks'
import globals from 'globals'

export default defineConfig([
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat['jsx-runtime'],
  reactHooksPlugin.configs.flat['recommended-latest'],
  tsReactHooksPlugin.default.configs.recommended,
  eslintConfigPrettier,
  {
    name: '@anjianshi/react/main',
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es6,
      },
    },
    rules: {
      'react/boolean-prop-naming': ['error'],
      'react/display-name': 'off',
      'react/prop-types': 'off', // TypeScript 下有时 props 的类型是自动推导出来的，此 rule 不适配这种情况
      'import-x/extensions': 'off', // Vite 不像 Node.js，它能处理好 ESM 模块的扩展名，所以不再需要此规则
    },
    settings: {
      react: {
        // 原本应设为 "detect"，但 eslint-plugin-react 有 bug，在值为 "detect" 时会调用最新版 ESLint 10 中已不存在的 API `context.getFilename()`，导致报错。
        // 临时解决办法就是明确指定版本。
        // 参见：
        // https://github.com/vercel/next.js/issues/89764
        // https://github.com/jsx-eslint/eslint-plugin-react/issues/4018
        version: '19',
      },
    },
  },
])
