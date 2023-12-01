import stylistic from '@stylistic/eslint-plugin';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';

import { FlatCompat } from '@eslint/eslintrc';
import path from 'path';
import { fileURLToPath } from 'url';

// mimic CommonJS variables -- not needed if using CommonJS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  js.configs.recommended,
  ...compat.extends('plugin:@typescript-eslint/recommended'),
  ...compat.extends('plugin:react-hooks/recommended'),
  stylistic.configs.customize({
    semi: true,
  }),
  {
    languageOptions: {
      parser: tsParser,
      globals: {
        ...globals.browser,
        ...globals.jest,
        ...globals.es2020,
        process: true,
      },
    },
    plugins: {
      'react-refresh': reactRefresh,
    },
    rules: {
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@stylistic/arrow-parens': 'off',
      '@stylistic/quote-props': ['error', 'as-needed'],
      '@stylistic/brace-style': ['error', '1tbs'],
    },
  },
];
