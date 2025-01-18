const { limitFiles } = require('./base/utils.cjs')

const configs = [
  ...require('./base/index.cjs'),
  ...limitFiles('{base,node,react,typescript}/', require('./node/exclusive.cjs')),

  // 各 demo 的规则
  ...limitFiles('demo/node/', require('./node/index.cjs')),
  ...limitFiles('demo/react/', require('./react/index.cjs')),
  {
    files: ['demo/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: './demo/tsconfig.json',
      },
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: './demo/',
        },
      },
    },
  },
]
module.exports = configs
