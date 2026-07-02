import { defineConfig } from 'eslint/config'
import typescriptConfigs from '../typescript/index.mjs'
import reactConfigs from './exclusive.mjs'

export default defineConfig([...typescriptConfigs, ...reactConfigs])
