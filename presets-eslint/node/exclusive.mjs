import { defineConfig } from 'eslint/config'
import globals from 'globals'

export default defineConfig([
  {
    name: '@anjianshi/node',
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es6,
      },
      parserOptions: {
        ecmaVersion: 'latest',
      },
    },
    settings: {
      'import-x/resolver': {
        node: true,
      },
    },
    rules: {
      'global-require': 'off',
      'no-console': 'off',
      'no-restricted-syntax': 'off',
      'import-x/no-dynamic-require': 'off',
    },
  },
])
