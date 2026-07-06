import baseConfigs from '@anjianshi/presets-eslint-base'
import { defineConfig } from 'eslint/config'
import typescriptConfigs from './exclusive.mjs'

export default defineConfig([...baseConfigs, ...typescriptConfigs])
