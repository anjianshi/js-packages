import { defineConfig } from 'eslint/config'
import typescriptConfigs from '../typescript/index.mjs'
import nodeConfigs from './exclusive.mjs'

export default defineConfig([...typescriptConfigs, ...nodeConfigs])
