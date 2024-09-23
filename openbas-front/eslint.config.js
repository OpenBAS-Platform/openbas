import path from 'path';
import { fileURLToPath } from 'url';
import stylistic from '@stylistic/eslint-plugin';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import js from '@eslint/js';
import eslintPluginImportX from 'eslint-plugin-import-x'
import reactRecommended from 'eslint-plugin-react/configs/recommended.js';
import customRules from './packages/eslint-plugin-custom-rules/lib/index.js';
import importNewlines from 'eslint-plugin-import-newlines';

// imports to not let tools report them as unused
import 'eslint-plugin-react-hooks';
import '@typescript-eslint/eslint-plugin';
import 'eslint-plugin-i18next';
import 'eslint-import-resolver-oxc';
import '@typescript-eslint/parser';

import { FlatCompat } from '@eslint/eslintrc';

// mimic CommonJS variables -- not needed if using CommonJS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// TODO add eslint-plugin-import when https://github.com/import-js/eslint-plugin-import/issues/2556 is done

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

  // rules recommended by eslint-plugin-import-x
  {
    ...eslintPluginImportX.flatConfigs.recommended,
    ...eslintPluginImportX.flatConfigs.typescript,
    "settings": {
      "import-x/resolver": "oxc"
    }
  },

  // rules recommended by @stylistic/eslint-plugin
  stylistic.configs.customize({
    semi: true,
  }),

  // rules recommended by @typescript-eslint/eslint-plugin  ---  typescript-eslint to avoid compat mode
  ...compat.extends('plugin:@typescript-eslint/recommended'),

  // rules recommended by eslint-plugin-react-hooks
  // ...compat.extends('plugin:react-hooks/recommended'), WAIT FOR https://github.com/facebook/react/issues/28313

  // rules recommended by eslint-plugin-i18next
  ...compat.extends('plugin:i18next/recommended'),

  {
    plugins: {
      // eslint-plugin-custom-rules config
      'custom-rules': customRules,
      // eslint-plugin-import-newlines config
      'import-newlines': importNewlines,
    },
    rules: {
      'custom-rules/classes-rule': 1,
    },
  },

  // other config
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.commonjs,
        ...globals.es2020,
        process: true,
      },
    },
    plugins: {
      'react-refresh': reactRefresh,
    },
    rules: {
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

      // import-newlines rules
      'import-newlines/enforce': ['error', {items: 20, 'max-len': 180}],

      // @stylistic rules
      // '@stylistic/arrow-parens': 'off',
      // '@stylistic/quote-props': ['error', 'as-needed'],
      // '@stylistic/brace-style': ['error', '1tbs'],

      'import-x/no-cycle': 'error',
    },
  },

  // ignores patterns
  {
    ignores: [
      'node_modules',
      'coverage',
      'packages',
      'public',
      'src/static/ext',
      'builder/prod/build',
      'builder/dev/build',
      '__generated__',
      'test-results',
      'playwright-report',
      'blob-report',
      'playwright/.cache',
    ],
  },
];
