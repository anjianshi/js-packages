import nodeExclusiveConfigs from '@anjianshi/presets-eslint-node/exclusive.mjs'
import reactExclusiveConfigs from '@anjianshi/presets-eslint-react/exclusive.mjs'
import typescriptConfigs from '@anjianshi/presets-eslint-typescript'
import { defineConfig } from 'eslint/config'

export default defineConfig([
  ...typescriptConfigs,
  {
    files: ['**/*.cjs'],
    extends: nodeExclusiveConfigs,
  },
  {
    basePath: 'src/env-node',
    extends: nodeExclusiveConfigs,
  },
  {
    basePath: 'src/env-react',
    extends: reactExclusiveConfigs,
  },
  {
    basePath: 'src/env-service',
    extends: nodeExclusiveConfigs,
  },
  {
    basePath: 'src/env-service/prisma',
    rules: {
      // prisma 相关方法需要保证返回的是 PrismaPromise 而不能是经过 async function 转过的 Promise，所以不能把函数标记为 async function
      '@typescript-eslint/promise-function-async': 'off',
    },
  },
  {
    basePath: 'src/env-service/prisma',
    rules: {
      // prisma extension 需要用到 any 类型
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },
])
