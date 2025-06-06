const globals = require('./globals.cjs')

module.exports = [
  // ESLint 配置文件自身的配置
  {
    name: 'configs-for-eslint-config-file',
    files: ['eslint.config.{js,cjs,mjs}'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },

  require('@eslint/js').configs.recommended,
  require('eslint-plugin-import-x').flatConfigs.recommended,
  require('eslint-config-prettier'),
  {
    name: 'anjianshi-base',
    rules: {
      // Possible Problems
      'array-callback-return': 'error',
      'no-constructor-return': 'error',
      'no-control-regex': 'off',
      'no-duplicate-imports': ['error', { includeExports: true }],
      'no-new-native-nonconstructor': 'error',
      'no-promise-executor-return': ['error', { allowVoid: true }],
      'no-self-compare': 'error',
      'no-template-curly-in-string': 'error',
      'no-unreachable-loop': 'error',
      'no-unused-vars': [
        'error',
        {
          varsIgnorePattern: 'React',
          argsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          caughtErrors: 'none',
        },
      ],
      'require-atomic-updates': ['error', { allowProperties: true }],

      // Suggestions
      'accessor-pairs': 'error',
      'block-scoped-var': 'error',
      curly: ['error', 'multi-line'],
      'default-case': 'error',
      'default-case-last': 'error',
      'default-param-last': 'off', // 此规则有缺陷：后面有其他可选参数的情况下，有默认值的参数应可以不在最后
      eqeqeq: 'error',
      'grouped-accessor-pairs': 'error',
      'guard-for-in': 'error',
      'no-alert': 'warn',
      'no-caller': 'error',
      'no-eq-null': 'error',
      'no-eval': 'error',
      'no-extend-native': 'error',
      'no-extra-bind': 'error',
      'no-extra-label': 'error',
      'no-floating-decimal': 'error',
      'no-implicit-globals': 'error',
      'no-implied-eval': 'error',
      'no-label-var': 'error',
      'no-labels': 'error',
      'no-lone-blocks': 'error',
      'no-mixed-operators': 'error',
      'no-multi-assign': 'error',
      'no-multi-str': 'error',
      'no-new-func': 'error',
      'no-new-wrappers': 'error',
      'no-octal-escape': 'error',
      'no-proto': 'error',
      'no-restricted-imports': 'error',
      'no-return-assign': 'error',
      'no-return-await': 'error',
      'no-script-url': 'error',
      'no-sequences': 'error',
      'no-throw-literal': 'error',
      'no-undef-init': 'error',
      'no-unneeded-ternary': 'error',
      'no-unused-expressions': 'error',
      'no-useless-call': 'error',
      'no-useless-computed-key': 'error',
      'no-useless-concat': 'error',
      'no-useless-constructor': 'error',
      'no-useless-rename': 'error',
      'no-useless-return': 'error',
      'no-var': 'error',
      'no-void': ['error', { allowAsStatement: true }],
      'object-shorthand': 'error',
      'prefer-const': 'error',
      'prefer-numeric-literals': 'error',
      'prefer-object-has-own': 'error',
      'prefer-object-spread': 'error',
      'prefer-promise-reject-errors': 'error',
      'prefer-rest-params': 'error',
      'prefer-spread': 'error',
      'prefer-template': 'off', // 自行选择要不要用 template string
      'quote-props': ['error', 'as-needed'],
      radix: 'error',
      'spaced-comment': ['error', 'always'],
      'symbol-description': 'error',
      yoda: 'error',

      // Import
      'import-x/extensions': ['error', 'always', { ts: 'never' }], // TODO: 暂没找到强制要求 .ts 代码里的引用带 `.js` 后缀又不报缺少 `.ts` 后缀的错的办法
      'import-x/no-useless-path-segments': ['error', { noUselessIndex: false }], // Node.js ES6 Module 里需要把 noUselessIndex 设为 false
      'import-x/no-named-as-default-member': 'off',
      'import-x/no-duplicates': ['error', { considerQueryString: true }],
      'import-x/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object'],
          alphabetize: { order: 'asc' },
        },
      ],
    },
  },
]
