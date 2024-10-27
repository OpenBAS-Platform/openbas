// imports to not let tools report them as unused
import 'eslint-import-resolver-oxc';

import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import i18next from 'eslint-plugin-i18next';
import importPlugin from 'eslint-plugin-import';
import playwright from 'eslint-plugin-playwright';
import react from 'eslint-plugin-react';
import reactRefresh from 'eslint-plugin-react-refresh';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import ts from 'typescript-eslint';

import customRules from './packages/eslint-plugin-custom-rules/lib/index.js';

export default [
  // rules recommended by @eslint/js
  js.configs.recommended,

  // rules recommended by typescript-eslint
  ...ts.configs.recommended,

  // rules recommended by eslint-plugin-react
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  {
    settings: {
      react: {
        version: 'detect',
      },
    },
  },

  // rules recommended by eslint-plugin-import
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,
  {
    settings: {
      'import/resolver': 'oxc',
      'import/ignore': [
        'react-apexcharts', // ignore react-apexcharts as the default export is broken
      ],
    },
  },

  // rules recommended by @stylistic/eslint-plugin
  stylistic.configs.customize({
    semi: true,
  }),

  // rules recommended by eslint-plugin-i18next
  i18next.configs['flat/recommended'],

  // other config
  {
    plugins: {
      // eslint-plugin-react-refresh
      'react-refresh': reactRefresh,
      // eslint-plugin-simple-import-sort
      'simple-import-sort': simpleImportSort,
      // local package eslint-plugin-custom-rules
      'custom-rules': customRules,
    },
    rules: {
      // react-refresh rules
      'react-refresh/only-export-components': [
        'warn',
        {
          allowConstantExport: true,
        },
      ],

      // eslint-plugin-simple-import-sort rules
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',

      // local package eslint-plugin-custom-rules rules
      'custom-rules/classes-rule': 1,

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
      '@typescript-eslint/no-use-before-define': 'error',

      // eslint-plugin-react rules
      'react/prop-types': 0,

      // @stylistic rules
      '@stylistic/brace-style': ['error', '1tbs'],
      '@stylistic/multiline-ternary': ['error', 'always-multiline', { ignoreJSX: true }],

      // eslint-plugin-import rules
      'import/no-named-as-default-member': 'off',
      'import/prefer-default-export': 'error',
      'import/namespace': 'off',

      // custom rules inspired from airbnb
      'sort-imports': 'off',
      'no-underscore-dangle': 'error',
      'no-await-in-loop': 'error',
      'no-param-reassign': 'error',
      'consistent-return': 'error',
      'default-case': 'error',
      'no-template-curly-in-string': 'error',
      'no-bitwise': 'error',
      'no-nested-ternary': 'error',
      'prefer-promise-reject-errors': 'error',
      'no-console': 'error',
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.commonjs,
        ...globals.es2020,
        process: true,
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'off', // to fix when eslint handle disable directive on missing rules on purpose
    },
  },

  // tests e2e config
  {
    files: ['tests_e2e/**/*'],
    // rules recommended by eslint-plugin-playwright
    ...playwright.configs['flat/recommended'],
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
      '.yarn',
    ],
  },
];
