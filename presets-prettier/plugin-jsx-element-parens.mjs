/**
 * 新增选项 jsxElementParens，值为 avoid 时去掉包裹 JSX 元素的括号。
 *
 * 这个括号是在 prettier/src/language-js/print/jsx.js 的 maybeWrapJsxElementInParens() 里加上的。
 * 解决思路源自：https://github.com/prettier/prettier/issues/2724#issuecomment-1010212039
 * 不过帖子里是 fork 了一个新 package，此处是通过插件来实现。
 *
 * 实现思路：
 * 1. 在插件里自定义 `babel-plugin-ext` 和 `typescript-plugin-ext` 两个 parser，把 astFormat 都设置为 `estree-plugin-ext`。
 *    prettier 会找与 parser 定义的 astFormat 同名的 printer 来执行格式化。
 *
 * 2. 在插件里自定义 `estree-plugin-ext` printer，使用修改过的 print() 函数。
 *
 * 3. 要求用户在 prettier 配置里，把 jsx 文件的 parser 设置为 `babel-plugin-ext`，tsx 文件的 parser 设置为 `typescript-plugin-ext`。
 */
import estreePlugin from 'prettier/plugins/estree.mjs'
import typescriptPlugin from 'prettier/plugins/typescript.mjs'
import babelPlugin from 'prettier/plugins/babel.mjs'

export const options = {
  jsxElementParens: {
    category: 'JavaScript',
    type: 'choice',
    default: 'always',
    description: 'Include parentheses around JSX Element.',
    choices: [
      {
        value: 'always',
        description: 'Always include parens.',
      },
      {
        value: 'avoid',
        description: 'Omit parens when possible.',
      },
    ],
  },
}

export const parsers = {
  'babel-plugin-ext': {
    ...babelPlugin.parsers.babel,
    astFormat: 'estree-plugin-ext',
  },
  'typescript-plugin-ext': {
    ...typescriptPlugin.parsers.typescript,
    astFormat: 'estree-plugin-ext',
  },
}

export const printers = {
  'estree-plugin-ext': {
    ...estreePlugin.printers.estree,
    print,
  },
}

function print(path, options, print, args) {
  const elem = estreePlugin.printers.estree.print(path, options, print, args)

  if (
    options.jsxElementParens === 'avoid' &&
    (path.node.type === 'JSXFragment' || path.node.type === 'JSXElement') &&
    elem.type === 'group' &&
    elem.contents.length > 2 &&
    elem.contents[0].type === 'if-break' &&
    elem.contents[0].breakContents === '(' &&
    elem.contents[1].contents.length >= 2
  ) {
    return elem.contents[1].contents[1]
  }

  return elem
}
