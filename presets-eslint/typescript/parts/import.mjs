/**
 * import 检验配置
 * 参考自 eslint-plugin-import-x 的 flatConfigs.typescript 内容
 */
import { tsExtensions, tsFiles } from './common.mjs'

export default {
  name: '@anjianshi/typescript/import',

  files: tsFiles,

  settings: {
    'import-x/external-module-folders': ['node_modules', 'node_modules/@types'],

    // 指定哪些扩展名的文件需要进一步解析（以看其导出了哪些内容）
    'import-x/extensions': [...tsExtensions, 'js', 'mjs', 'cjs', 'jsx', 'mjsx', 'cjsx'],

    // 指定各扩展名要使用什么 parser 来解析(以看其导出了哪些内容)
    // 未指定的当做普通 JavaScript 文件处理
    'import-x/parsers': {
      '@typescript-eslint/parser': [...tsExtensions],
    },

    'import-x/resolver': {
      node: true,
      typescript: {
        project: './',
      },
    },
  },

  rules: {
    // TypeScript 会自行检查以下项目，禁用它们以避免冲突并提升性能.
    // <https://typescript-eslint.io/troubleshooting/typed-linting/performance#eslint-plugin-import>
    'import-x/default': 'off',
    'import-x/named': 'off',
    'import-x/namespace': 'off',
    'import-x/no-named-as-default-member': 'off',
    'import-x/no-unresolved': 'off',
  },
}
