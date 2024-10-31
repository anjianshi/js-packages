const globals = require('@anjianshi/presets-eslint-base/globals.cjs')
const reactPlugin = require('eslint-plugin-react')
const reactHooksPlugin = require('eslint-plugin-react-hooks')

module.exports = [
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat['jsx-runtime'],
  {
    plugins: { 'react-hooks': reactHooksPlugin },
    rules: reactHooksPlugin.configs.recommended.rules,
  },
  require('eslint-plugin-ts-react-hooks').configs.recommended,
  require('eslint-config-prettier'),
  {
    name: 'anjianshi-react',
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
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
]
