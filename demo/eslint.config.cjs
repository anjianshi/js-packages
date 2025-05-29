const { limitFiles } = require('@anjianshi/presets-eslint-base/utils.cjs')

module.exports = [
  ...require('@anjianshi/presets-eslint-base/index.cjs'),
  ...limitFiles(
    ['eslint/node/', 'typescript/'],
    require('@anjianshi/presets-eslint-node/index.cjs'),
  ),
  ...limitFiles('eslint/react/', require('@anjianshi/presets-eslint-react/index.cjs')),
]
