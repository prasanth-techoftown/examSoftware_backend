import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin' // Fixed package name
import prettierPlugin from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'
import unusedImports from 'eslint-plugin-unused-imports'
export default [
    {
        // This replaces .eslintignore
        ignores: ['dist/**', 'node_modules/**', 'jest.config.ts'],
    },

    {
        files: ['**/*.ts'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                project: './tsconfig.json',
                tsconfigRootDir: import.meta.dirname,
                sourceType: 'module',
            },
        },
        plugins: {
            '@typescript-eslint': tsPlugin,
            prettier: prettierPlugin,
            'unused-imports': unusedImports,
        },
        rules: {
            // Manually spreading recommended rules since v9 doesn't use "extends" strings
            'unused-imports/no-unused-imports': 'error',
            ...tsPlugin.configs['recommended'].rules,
            //...tsPlugin.configs["recommended-requiring-type-checking"].rules,
            ...prettierConfig.rules,
            'unused-imports/no-unused-vars': [
                'warn',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
            ],

            '@typescript-eslint/no-unused-vars': [
                'error',
                { argsIgnorePattern: '^_' },
            ],
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/no-floating-promises': 'error',
            'prettier/prettier': 'error',
            '@typescript-eslint/require-await': 'error',
        },
    },
]
