import { defineConfig } from 'eslint/config'
import typescriptConfigs from '../typescript/index.mjs'
import reactExclusiveConfigs from './exclusive.mjs'

export default defineConfig([...typescriptConfigs, ...reactExclusiveConfigs])
