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
  // TypeScript 会自行检查以下项目，禁用以避免冲突并提升性能.
  // Checked by TypeScript itself, disable to avoid conflicts and improve performance.
  // <https://typescript-eslint.io/linting/troubleshooting/performance-troubleshooting/#eslint-plugin-import>
  'import/default': 'off',
  'import/named': 'off',
  'import/namespace': 'off',

  // 交给 @typescript-eslint/switch-exhaustiveness-check 规则来检查 switch
  // Use the '@typescript-eslint/switch-exhaustiveness-check' rule to check switch cases.
  'default-case': 'off',

  // Typescript 里 void 符号另有用途
  // Void has another use in TypeScript.
  'no-void': 'off',

  // Supported Rules
  '@typescript-eslint/array-type': 'error',
  '@typescript-eslint/ban-ts-comment': ['error', { 'ts-ignore': 'allow-with-description' }],
  '@typescript-eslint/consistent-type-exports': [
    'error',
    { fixMixedExportsWithInlineTypeSpecifier: true },
  ],
  '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
  '@typescript-eslint/explicit-member-accessibility': ['error', { accessibility: 'no-public' }],
  '@typescript-eslint/no-confusing-non-null-assertion': 'error',
  '@typescript-eslint/no-confusing-void-expression': [
    'error',
    { ignoreArrowShorthand: true, ignoreVoidOperator: true },
  ],
  '@typescript-eslint/no-explicit-any': ['error', { fixToUnknown: false, ignoreRestArgs: true }],
  '@typescript-eslint/no-extraneous-class': 'error',
  '@typescript-eslint/no-non-null-asserted-nullish-coalescing': 'error',
  '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],
  '@typescript-eslint/no-non-null-assertion': 'off',
  '@typescript-eslint/no-this-alias': 'off',
  '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
  '@typescript-eslint/no-unnecessary-condition': ['error', { allowConstantLoopConditions: true }],
  '@typescript-eslint/no-unnecessary-qualifier': 'error',
  '@typescript-eslint/no-unnecessary-type-arguments': 'error',
  '@typescript-eslint/no-unsafe-declaration-merging': 'error',
  '@typescript-eslint/no-var-requires': 'off',
  '@typescript-eslint/non-nullable-type-assertion-style': 'error',
  '@typescript-eslint/prefer-enum-initializers': 'error',
  '@typescript-eslint/prefer-for-of': 'error',
  '@typescript-eslint/prefer-function-type': 'error',
  '@typescript-eslint/prefer-includes': 'error',
  '@typescript-eslint/prefer-literal-enum-member': 'error',
  '@typescript-eslint/prefer-nullish-coalescing': 'error',
  '@typescript-eslint/prefer-readonly': 'error',
  '@typescript-eslint/prefer-reduce-type-parameter': 'error',
  '@typescript-eslint/prefer-regexp-exec': 'error',
  '@typescript-eslint/prefer-return-this-type': 'error',
  '@typescript-eslint/prefer-string-starts-ends-with': 'error',
  '@typescript-eslint/promise-function-async': 'error',
  '@typescript-eslint/require-array-sort-compare': ['error', { ignoreStringArrays: true }],
  '@typescript-eslint/strict-boolean-expressions': 'error',
  '@typescript-eslint/switch-exhaustiveness-check': 'error',
  // 此规则对有些情况适配的不好
  // "This rule does not adapt well to some scenarios.
  '@typescript-eslint/unbound-method': 'off',
  '@typescript-eslint/unified-signatures': 'error',

  // Extension Rules
  'default-param-last': 'off',
  '@typescript-eslint/default-param-last': 'error',
  '@typescript-eslint/no-empty-function': 'off',
  '@typescript-eslint/no-loop-func': 'off',
  '@typescript-eslint/no-loss-of-precision': 'error',
  'no-redeclare': 'off',
  '@typescript-eslint/no-redeclare': 'error',
  '@typescript-eslint/no-throw-literal': 'error',
  'no-unused-expressions': 'off',
  '@typescript-eslint/no-unused-expressions': 'error',
  'no-unused-vars': 'off',
  '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: 'React|[iI]gnored' }],
  'no-useless-constructor': 'off',
  '@typescript-eslint/no-useless-constructor': 'error',
  quotes: 'off',
  '@typescript-eslint/quotes': ['error', 'single', { avoidEscape: true }],
  '@typescript-eslint/return-await': 'error',

  // Import
  'import/no-duplicates': ['error', { 'prefer-inline': true, considerQueryString: true }],
}

module.exports = {
  overrides: [
    {
      files: ['*.ts', '*.mts', '*.cts', '*.tsx'],
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:import/typescript',
        'prettier',
      ],
      parserOptions: {
        project: './tsconfig.json',
      },
      settings: {
        'import/resolver': {
          typescript: {
            project: './',
          },
        },
      },
      rules,
    },
  ],
}
