import { defineConfig } from 'eslint/config'
import baseConfigs from '../base/index.mjs'
import typescriptConfigs from './exclusive.mjs'

export default defineConfig([...baseConfigs, ...typescriptConfigs])
