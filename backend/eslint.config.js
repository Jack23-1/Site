import js from '@eslint/js'
import globals from 'globals'

export default [
  { ignores: ['.local-postgres/**', '.local-media/**', 'test-results/**'] },
  { files: ['**/*.mjs', '**/*.js'], languageOptions: { ecmaVersion: 'latest', sourceType: 'module', globals: globals.node }, rules: js.configs.recommended.rules },
  { files: ['tests/browser.mjs'], languageOptions: { globals: globals.browser } },
]
