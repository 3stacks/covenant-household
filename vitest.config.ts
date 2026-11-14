import { defineConfig } from 'vitest/config'

// The tests also import code from apps/mobile. That folder has its own
// tsconfig.json, which extends expo/tsconfig.base. CI does not install the
// mobile packages, so all files use the tsconfig.json at the root.
export default defineConfig({
  tsconfig: 'tsconfig.json',
})
