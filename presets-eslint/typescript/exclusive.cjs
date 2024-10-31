const tseslint = require('typescript-eslint')

/*
【一些规则不启用的理由】
【Reasons for not enabling some rules】

@typescript-eslint/consistent-type-definitions
这条规则未能覆盖所有情况。有些时候必须用 type，不能用 interface，但它识别不出来。
This rule does not cover all cases. Sometimes it is necessary to use 'type' instead of 'interface',
but the rule fails to recognize this and raises false positives.

@typescript-eslint/no-invalid-void-type
这条规则不能很好地覆盖所有情况，例如一个类型有个 generic type，是最终用于定义函数返回值的，本应允许是 void，但这条规则不允许。
This rule cannot cover all scenarios effectively,
for example, when a type has a generic type that is ultimately used to define a function return value,
which should allow void but is not permitted by this rule.

@typescript-eslint/no-meaningless-void-operator
这条和 no-confusing-void-expression 的规则冲突
Conflicts with 'no-confusing-void-expression'.

@typescript-eslint/prefer-optional-chain
这条会和其他规则起冲突
Conflicts with other rules.
*/

const rules = {
  // 交给 @typescript-eslint/switch-exhaustiveness-check 规则来检查 switch
  // Use the '@typescript-eslint/switch-exhaustiveness-check' rule to check switch cases.
  'default-case': 'off',

  // Typescript 里 void 符号另有用途
  // Void has another use in TypeScript.
  'no-void': 'off',

  // Supported Rules
  '@typescript-eslint/ban-ts-comment': ['error', { 'ts-ignore': 'allow-with-description' }],
  '@typescript-eslint/consistent-type-exports': [
    'error',
    { fixMixedExportsWithInlineTypeSpecifier: true },
  ],
  '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
  '@typescript-eslint/explicit-member-accessibility': ['error', { accessibility: 'no-public' }],
  '@typescript-eslint/no-confusing-void-expression': [
    'error',
    { ignoreArrowShorthand: true, ignoreVoidOperator: true },
  ],
  '@typescript-eslint/no-explicit-any': ['error', { fixToUnknown: false, ignoreRestArgs: true }],
  '@typescript-eslint/no-non-null-asserted-nullish-coalescing': 'error',
  '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],
  '@typescript-eslint/no-non-null-assertion': 'off',
  '@typescript-eslint/no-this-alias': 'off',
  '@typescript-eslint/no-unnecessary-condition': ['error', { allowConstantLoopConditions: true }],
  '@typescript-eslint/no-unnecessary-qualifier': 'error',
  '@typescript-eslint/prefer-enum-initializers': 'error',
  '@typescript-eslint/prefer-readonly': 'error',
  '@typescript-eslint/promise-function-async': 'error',
  '@typescript-eslint/require-array-sort-compare': ['error', { ignoreStringArrays: true }],
  '@typescript-eslint/strict-boolean-expressions': 'off', // 这个规则不能正确判断 object | null | boolean 的情况
  '@typescript-eslint/switch-exhaustiveness-check': 'error',
  '@typescript-eslint/unbound-method': 'off', // 此规则对有些情况适配的不好

  // Extension Rules
  'default-param-last': 'off',
  '@typescript-eslint/default-param-last': 'error',
  '@typescript-eslint/no-empty-function': 'off',
  '@typescript-eslint/no-loop-func': 'off',
  '@typescript-eslint/no-loss-of-precision': 'error',
  'no-redeclare': 'off',
  '@typescript-eslint/no-redeclare': 'error',
  'no-unused-expressions': 'off',
  '@typescript-eslint/no-unused-expressions': 'error',
  'no-unused-vars': 'off',
  '@typescript-eslint/no-unused-vars': [
    'error',
    {
      varsIgnorePattern: 'React',
      argsIgnorePattern: '^_',
      destructuredArrayIgnorePattern: '^_',
      caughtErrors: 'none',
    },
  ],
  'no-useless-constructor': 'off',
  '@typescript-eslint/no-useless-constructor': 'error',
  '@typescript-eslint/return-await': 'error',

  'import/no-duplicates': ['error', { 'prefer-inline': true, considerQueryString: true }],
}

const files = ['**/*.{ts,mts,cts,tsx,mtsx,ctsx']

module.exports = [
  { files, ...tseslint.configs.strict },
  { files, ...tseslint.configs.stylistic },
  {
    ...require('eslint-plugin-import/config/typescript'),
    files,
    settings: {
      'import/resolver': {
        node: true,
        typescript: {
          project: './',
        },
      },
    },
    rules: {
      // TypeScript 会自行检查以下项目，禁用以避免冲突并提升性能.
      // Checked by TypeScript itself, disable to avoid conflicts and improve performance.
      // <https://typescript-eslint.io/troubleshooting/typed-linting/performance#eslint-plugin-import>
      'import/default': 'off',
      'import/named': 'off',
      'import/namespace': 'off',
      'import/no-named-as-default-member': 'off',
      'import/no-unresolved': 'off',
    },
  },
  require('eslint-config-prettier'),
  {
    name: 'anjianshi-typescript',
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    files,
    rules,
  },
]
