import baseConfigs from '@anjianshi/presets-eslint-base'
import nodeConfigs from '@anjianshi/presets-eslint-node'
import reactConfigs from '@anjianshi/presets-eslint-react'
import { defineConfig } from 'eslint/config'

const configs = defineConfig([
  ...baseConfigs,
  {
    name: 'configs-for-demo-eslint-node',
    basePath: 'eslint/node',
    extends: nodeConfigs,
  },
  {
    name: 'configs-for-demo-eslint-react',
    basePath: 'eslint/react',
    extends: reactConfigs,
  },
  {
    name: 'configs-for-demo-typescript',
    basePath: 'typescript',
    extends: nodeConfigs,
  },
])
export default configs
