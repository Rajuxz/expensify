import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import turboConfig from 'eslint-config-turbo/flat';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import unusedImports from 'eslint-plugin-unused-imports';
import prettier from 'eslint-config-prettier/flat';
import tsParser from '@typescript-eslint/parser';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...turboConfig,
  eslintPluginPrettierRecommended,
  prettier,
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'eslint.config.mjs',
    'modules/types.ts',
    'modules/hooks.ts',
    'modules/generated.ts',
    'graphql/script.ts',
    'graphql/hooks.ts',
    'next.config.ts',
    'node_modules',
    'public',
    'components/ui/*',
  ]),
  {
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: 'tsconfig.json',
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'variable',
          modifiers: ['destructured'],
          format: null,
        },
        {
          selector: 'function',
          format: ['strictCamelCase'],
        },

        {
          selector: 'variable',
          format: null,
          types: ['boolean'],
          prefix: ['is', 'should', 'has', 'can', 'did', 'will'],
        },
        {
          selector: 'interface',
          format: ['StrictPascalCase'],
          prefix: ['I'],
        },
        {
          selector: 'enum',
          format: ['StrictPascalCase'],
        },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-unused-vars': 0,
      'import/no-named-as-default': 0,
      '@typescript-eslint/no-unused-vars': 0,
      'unused-imports/no-unused-imports': 1,
      'unused-imports/no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'none',
          ignoreRestSiblings: true,
        },
      ],
      'import/order': [
        'error',
        {
          alphabetize: { order: 'asc', caseInsensitive: false },
          'newlines-between': 'always-and-inside-groups',
          warnOnUnassignedImports: true,
        },
      ],
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: [
            '**/*.test.{ts,js}',
            '**/*.spec.{ts,js}',
            './test/**.{ts,js}',
            './scripts/**/*.{ts,js}',
          ],
        },
      ],
      'turbo/no-undeclared-env-vars': [
        'error',
        {
          allowList: ['NODE_ENV'],
        },
      ],
    },
  },
]);

export default eslintConfig;