const globals = require('./base/globals.cjs')
module.exports = [
  {
    languageOptions: {
      globals: globals.node,
    },
  },
  ...require('./base/index.cjs'),
]
