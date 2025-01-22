const globals = require('@anjianshi/presets-eslint-base/globals.cjs')
const { limitFiles } = require('@anjianshi/presets-eslint-base/utils.cjs')

const configs = [
  ...require('@anjianshi/presets-eslint-base'),
  ...require('@anjianshi/presets-eslint-typescript'),
  ...limitFiles(
    ['*.cjs', 'src/{env-node, env-service}/'],
    require('@anjianshi/presets-eslint-node/exclusive.cjs'),
  ),
  ...limitFiles('src/env-browser/', {
    languageOptions: {
      globals: { ...globals.browser },
    },
  }),
  ...limitFiles('src/env-react/', require('@anjianshi/presets-eslint-react/exclusive.cjs')),
  ...limitFiles('src/env-service/prisma/', {
    rules: {
      // prisma 相关方法需要保证返回的是 PrismaPromise 而不能是经过 async function 转过的 Promise，所以不能把函数标记为 async function
      '@typescript-eslint/promise-function-async': 'off',
    },
  }),
  ...limitFiles('src/env-service/prisma/extensions/', {
    rules: {
      // prisma extension 需要用到 any 类型
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  }),
]
module.exports = configs
