const globals = require('@anjianshi/presets-eslint-base/globals.cjs')

function transform(name, oldConfig) {
  const { parserOptions = {}, rules, plugins: pluginNames, ...rest } = oldConfig

  const plugins = {}
  for (const name of pluginNames) {
    plugins[name] = require(name.startsWith('eslint-plugin-') ? name : `eslint-plugin-${name}`)
  }

  return {
    name,
    languageOptions: { parserOptions },
    plugins,
    rules,
    ...rest,
  }
}

module.exports = [
  transform('eslint-plugin-react', require('eslint-plugin-react').configs.recommended),
  transform(
    'eslint-plugin-react-jsx-runtime',
    require('eslint-plugin-react').configs['jsx-runtime']
  ),
  transform('eslint-plugin-react-hooks', require('eslint-plugin-react-hooks').configs.recommended),
  require('eslint-plugin-ts-react-hooks').configs.recommended,
  require('eslint-config-prettier'),
  {
    name: 'anjianshi-react',
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es6,
      },
    },
    rules: {
      'react/boolean-prop-naming': ['error'],
      'react/display-name': 'off',
      'react/prop-types': 'off', // TypeScript 下有时 props 的类型是自动推导出来的，此 rule 不适配这种情况
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
]
