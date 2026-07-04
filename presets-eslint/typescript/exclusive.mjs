import { defineConfig } from 'eslint/config'
import eslintConfigPrettier from 'eslint-config-prettier'
import tseslint from 'typescript-eslint'
import { tsFiles } from './parts/common.mjs'
import importConfig from './parts/import.mjs'
import mainConfig from './parts/main.mjs'

export default defineConfig([
  ...tseslint.configs.strictTypeChecked.map(config => ({ ...config, files: tsFiles })),
  ...tseslint.configs.stylisticTypeChecked.map(config => ({ ...config, files: tsFiles })),
  eslintConfigPrettier,
  importConfig,
  mainConfig,
])
