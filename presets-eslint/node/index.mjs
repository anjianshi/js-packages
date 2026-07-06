import typescriptConfigs from '@anjianshi/presets-eslint-typescript'
import { defineConfig } from 'eslint/config'
import nodeExclusiveConfigs from './exclusive.mjs'

export default defineConfig([...typescriptConfigs, ...nodeExclusiveConfigs])
