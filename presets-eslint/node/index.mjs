import { defineConfig } from 'eslint/config'
import typescriptConfigs from '../typescript/index.mjs'
import nodeExclusiveConfigs from './exclusive.mjs'

export default defineConfig([...typescriptConfigs, ...nodeExclusiveConfigs])
