import { defineConfig } from 'eslint/config';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import prettier from 'eslint-plugin-prettier';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  // recommendedConfig: js.configs.recommended,
  // allConfig: js.configs.all
});

export default defineConfig([
  {
    files: ['**/*.ts'], // Target TypeScript files
    extends: [
      js.configs.recommended, // ESLint's recommended rules
      ...compat.extends(
        'plugin:@typescript-eslint/recommended', // @typescript-eslint recommended rules
        'plugin:@typescript-eslint/recommended-requiring-type-checking', // @typescript-eslint rules needing type information
        'prettier' // Prettier's config to disable conflicting rules
      ),
    ],
    // extends: compat.extends(
    //   'eslint:recommended',
    //   '@typescript-eslint/recommended',
    //   '@typescript-eslint/recommended-requiring-type-checking',
    //   'prettier'
    // ),

    plugins: {
      '@typescript-eslint': typescriptEslint,
      prettier,
    },

    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },

      parser: tsParser,
      ecmaVersion: 2020,
      sourceType: 'module',

      parserOptions: {
        project: './tsconfig.json',
      },
    },

    rules: {
      'prettier/prettier': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-inferrable-types': 'error',
      '@typescript-eslint/no-non-null-assertion': 'warn',
    },
  },
]);

// Migrated from .eslintrc.json.
// Using the ES Lint v9 and above uses the new config format.
// Migrated using 'npx @eslint/migrate-config .eslintrc.json'
// This file is now an ES module, so we use import/export syntax.
