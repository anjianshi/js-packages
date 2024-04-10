/**
 * 新增选项 jsxElementParens，值为 avoid 时去掉包裹 JSX 元素的括号。
 *
 * 这个括号是在 prettier/src/language-js/print/jsx.js 的 maybeWrapJsxElementInParens() 里加上的。
 * 解决思路源自：https://github.com/prettier/prettier/issues/2724#issuecomment-1010212039
 * 不过帖子里是 fork 了一个新 package，此处是通过插件来实现。
 */
import plugin from 'prettier/plugins/estree.mjs'

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
  }
}

// 自己定义的 JavaScript printer 不会生效，只能覆盖 Prettier 自带的。
const originPrint = plugin.printers.estree.print
plugin.printers.estree = {
  ...plugin.printers.estree,
  print,
}
function print(path, options, print, args) {
  const elem = originPrint(path, options, print, args)
  if (
    options.jsxElementParens === 'avoid'
    && (path.node.type === 'JSXFragment' || path.node.type === 'JSXElement')
    && elem.type === 'group'
    && elem.contents.length > 2
    && elem.contents[0].type === 'if-break'
    && elem.contents[0].breakContents === '('
    && elem.contents[1].contents.length >= 2
  ) {
    return elem.contents[1].contents[1]
  }
  return elem
}
