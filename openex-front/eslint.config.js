import path from 'path';
import { fileURLToPath } from 'url';
import stylistic from '@stylistic/eslint-plugin';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import reactRecommended from 'eslint-plugin-react/configs/recommended.js';
import importPlugin from 'eslint-plugin-import';

// import eslint-plugin-react-hooks & @typescript-eslint/eslint-plugin & customRules to not let tools report them as unused
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import eslintPluginReactHooks from 'eslint-plugin-react-hooks';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import tsEslintEslintPlugin from '@typescript-eslint/eslint-plugin';

import { FlatCompat } from '@eslint/eslintrc';
import customRules from 'eslint-plugin-custom-rules';

// mimic CommonJS variables -- not needed if using CommonJS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  // rules recommended by @eslint/js
  js.configs.recommended,

  // rules recommended by eslint-plugin-react
  {
    ...reactRecommended,
    settings: {
      react: {
        version: 'detect',
      },
    },
  },

  // rules recommended by @stylistic/eslint-plugin
  stylistic.configs.customize({
    semi: true,
  }),

  // rules recommended by @typescript-eslint/eslint-plugin
  ...compat.extends('plugin:@typescript-eslint/recommended'),

  // rules recommended by eslint-plugin-react-hooks
  ...compat.extends('plugin:react-hooks/recommended'),

  // eslint-plugin-custom-rules config
  {
    plugins: {
      'custom-rules': customRules,
    },
    rules: {
      'custom-rules/classes-rule': 1,
    },
  },

  // other config
  {
    languageOptions: {
      parser: tsParser,
      globals: {
        ...globals.browser,
        ...globals.commonjs,
        ...globals.es2020,
        process: true,
      },
    },
    plugins: {
      'react-refresh': reactRefresh,
      import: importPlugin,
    },
    rules: {
      // import rules
      'import/prefer-default-export': 'error',
      'import/order': 'error',

      // react-refresh rules
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      // react rules
      'react/no-unused-prop-types': 0,
      'react/prop-types': 0,

      // @typescript-eslint rules
      '@typescript-eslint/naming-convention': ['error', {
        selector: 'variable',
        format: ['camelCase', 'UPPER_CASE'],
        leadingUnderscore: 'allow',
        trailingUnderscore: 'allow',
        filter: {
          regex: '/([^_]*)/',
          match: true,
        },
      }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      // @stylistic rules
      '@stylistic/arrow-parens': 'off',
      '@stylistic/quote-props': ['error', 'as-needed'],
      '@stylistic/brace-style': ['error', '1tbs'],
    },
  },

  // ignores patterns
  {
    ignores: ['src/static/ext', 'packages', 'builder/prod/build', 'builder/dev/build'],
  },
];
