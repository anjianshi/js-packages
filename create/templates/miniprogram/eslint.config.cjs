const globals = require('@anjianshi/presets-eslint-base/globals.cjs')
module.exports = [
  {
    ignores: ['dist/*'],
  },
  ...require('@anjianshi/presets-eslint-typescript'),
  {
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: ['gulpfile.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ['typings/**/*.d.ts'],
    rules: {
      'spaced-comment': 'off',
      '@typescript-eslint/triple-slash-reference': 'off',
    },
  },
]
