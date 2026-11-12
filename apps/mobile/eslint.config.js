// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    // calendar/ is written by scripts/build-calendar.ts.
    ignores: ['dist/*', 'calendar/*'],
  },
]);
