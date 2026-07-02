import { limitFiles } from '@anjianshi/presets-eslint-base/utils.mjs'
import baseConfigs from '@anjianshi/presets-eslint-base'
import nodeConfigs from '@anjianshi/presets-eslint-node'
import reactConfigs from '@anjianshi/presets-eslint-react'

export default [
  ...baseConfigs,
  ...limitFiles(['eslint/node/', 'typescript/'], nodeConfigs),
  ...limitFiles('eslint/react/', reactConfigs),
]
