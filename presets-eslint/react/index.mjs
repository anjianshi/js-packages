import typescriptConfigs from '@anjianshi/presets-eslint-typescript'
import { defineConfig } from 'eslint/config'
import reactExclusiveConfigs from './exclusive.mjs'

export default defineConfig([...typescriptConfigs, ...reactExclusiveConfigs])
