const path = require('path')
const packageDir = path.resolve(__dirname)

// 只定义与默认值不同的项，完整列表见：https://prettier.io/docs/en/options.html
module.exports = {
  printWidth: 100,
  semi: false,
  singleQuote: true,
  arrowParens: 'avoid',

  // 来自插件的选项
  jsxElementParens: 'avoid',
  plugins: [path.join(packageDir, 'plugin-jsx-element-parens.mjs')],

  overrides: [
    {
      files: ['*.html', '*.wxml'],
      options: {
        printWidth: 200,
      },
    },

    // 使用插件自己定义的 parser 来处理文件
    {
      files: ['*.jsx'],
      options: {
        parser: 'babel-plugin-ext',
      },
    },
    {
      files: ['*.tsx'],
      options: {
        parser: 'typescript-plugin-ext',
      },
    },
  ],
}
