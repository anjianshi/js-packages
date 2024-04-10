module.exports = {
  env: {
    node: true,
    es6: true,
  },
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'global-require': 'off',
    'no-console': 'off',
    'no-restricted-syntax': 'off',
    'import/no-dynamic-require': 'off',
  },
}
