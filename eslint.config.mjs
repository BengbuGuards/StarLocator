import globals from 'globals';
import pluginJs from '@eslint/js';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
    {
        ignores: ['dist/'],
    },
    {
        languageOptions: {
            globals: globals.browser,
        },
        plugins: {
            prettier: prettierPlugin,
        },
        rules: {
            ...prettierConfig.rules,
            'prettier/prettier': 'error',
        },
    },
    pluginJs.configs.recommended,
    prettierConfig,
];
