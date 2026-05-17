// Flat ESLint config (ESLint 9+)
export default [
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/*.tsbuildinfo'],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    rules: {
      'no-unused-vars': 'off',
      'no-console': 'off',
    },
  },
];
