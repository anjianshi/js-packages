const globals = require('@anjianshi/presets-eslint-base/globals.cjs')

module.exports = [
  ...require('@anjianshi/presets-eslint-base'),
  ...require('@anjianshi/presets-eslint-typescript'),

  {
    files: ['*.cjs', 'src/env-node/**/*.*', 'src/env-service/**/*.*'],
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

  {
    files: ['src/env-service/prisma/**/*.*'],
    rules: {
      // prisma 相关方法需要保证返回的是 PrismaPromise 而不能是经过 async function 转过的 Promise，所以不能把函数标记为 async function
      '@typescript-eslint/promise-function-async': 'off',
    },
  },
  {
    files: ['src/env-service/prisma/extensions/**/*.*'],
    rules: {
      // prisma extension 需要用到 any 类型
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
]
