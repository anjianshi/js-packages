const globals = require('@anjianshi/presets-eslint-base/globals.cjs')
module.exports = [
  {
    name: 'anjianshi-node',
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es6,
      },
      parserOptions: {
        ecmaVersion: 'latest',
      },
    },
    rules: {
      'global-require': 'off',
      'no-console': 'off',
      'no-restricted-syntax': 'off',
    },
  },
]
