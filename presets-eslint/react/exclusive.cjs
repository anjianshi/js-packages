module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  plugins: ['react-hooks'],
  extends: [
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'plugin:ts-react-hooks/recommended',
    'prettier',
  ],
  rules: {
    // 此规则不适合 React 组件场景，此场景是可以保证组件函数一定会在很后面才被调用，不用担心变量顺序。
    // 且很多时候为了代码方便阅读，确实需要把一些变量（如 emotion css 定义）放在组件函数后面。
    // This rule is not applicable to React component scenarios, where it can be ensured that the component function will always be called at the end,
    // so there is no need to worry about variable order.
    // Moreover, in many cases, for the convenience of code readability,
    // it is necessary to place some variables (such as Emotion CSS definitions) after the component function.
    'no-use-before-define': 'off',
    // 这个规则有缺陷，在 async 方法里修改 react ref 会误报
    // This rule is flawed and produces false positives when modifying a React ref inside an async method.
    'require-atomic-updates': 'off',
    'react/boolean-prop-naming': ['error'],
    'react/display-name': 'off',
    // TypeScript 下有时 props 的类型是自动推导出来的，此 rule 不适配这种情况
    // In TypeScript, sometimes the type of props is automatically inferred, this rule is not compatible with this situation.
    'react/prop-types': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
}
