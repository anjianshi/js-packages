const globals = require('@anjianshi/presets-eslint-base/globals.cjs')

module.exports = [
  ...require('@anjianshi/presets-eslint-base'),
  ...require('@anjianshi/presets-eslint-typescript'),

  {
    files: ['*.cjs', 'src/env-node/**/*.*'],
    ...require('@anjianshi/presets-eslint-node/exclusive.cjs')[0],
  },

  {
    files: ['src/env-browser/**/*.*'],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },

  ...require('@anjianshi/presets-eslint-react/exclusive.cjs').map(config => ({
    ...config,
    files: ['src/env-react/**/*.*'],
  })),
]
